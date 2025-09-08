# location/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import UserLocation
from .serializers import UserLocationSerializer

class UserLocationViewSet(viewsets.ModelViewSet):
    """
    CRUD كامل للمواقع مع إمكانية البحث بالقرب من إحداثيات.
    يدعم multiple locations للمستخدم.
    """
    queryset = UserLocation.objects.all()
    serializer_class = UserLocationSerializer
    permission_classes = [permissions.IsAuthenticated]  # يتطلب تسجيل الدخول

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return UserLocation.objects.select_related('user').all()
        else:
            # للمستخدمين المسجلين، إرجاع مواقعهم فقط
            return UserLocation.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        """ربط الموقع بالمستخدم الحالي تلقائياً"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-locations')
    def my_locations(self, request):
        """الحصول على جميع مواقع المستخدم مرتبة من الأحدث"""
        locations = UserLocation.objects.filter(user=request.user).order_by('-created_at')
        serializer = self.get_serializer(locations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='latest-location')
    def latest_location(self, request):
        """الحصول على آخر موقع للمستخدم"""
        try:
            location = UserLocation.objects.filter(user=request.user).latest('created_at')
            serializer = self.get_serializer(location)
            return Response(serializer.data)
        except UserLocation.DoesNotExist:
            return Response(
                {"message": "لا يوجد مواقع محفوظة"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'], url_path='save-location')
    def save_location(self, request):
        """حفظ موقع جديد للمستخدم مع دعم جميع الحقول"""
        # التحقق من المصادقة
        if not request.user.is_authenticated:
            return Response(
                {"error": "يجب تسجيل الدخول أولاً"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        lat = request.data.get('lat')
        lng = request.data.get('lng')
        address = request.data.get('address', '')
        city = request.data.get('city', '')
        country = request.data.get('country', 'مصر')
        
        # الحقول الإضافية
        name = request.data.get('name', '')
        location_type = request.data.get('location_type', 'other')
        neighborhood = request.data.get('neighborhood', '')
        building_number = request.data.get('building_number', '')
        apartment_number = request.data.get('apartment_number', '')
        floor_number = request.data.get('floor_number', '')
        landmark = request.data.get('landmark', '')
        additional_details = request.data.get('additional_details', '')
        is_primary = request.data.get('is_primary', False)

        if not lat or not lng:
            return Response(
                {"error": "خط العرض وخط الطول مطلوبان"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # التحقق من صحة الإحداثيات
            lat_float = float(lat)
            lng_float = float(lng)
            
            if not (-90 <= lat_float <= 90) or not (-180 <= lng_float <= 180):
                return Response(
                    {"error": "الإحداثيات غير صحيحة"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            point = Point(lng_float, lat_float, srid=4326)
            
            # التحقق من صحة نوع الموقع
            valid_location_types = ['home', 'work', 'favorite', 'other']
            if location_type not in valid_location_types:
                location_type = 'other'
            
            # إنشاء موقع جديد مع جميع الحقول
            location = UserLocation.objects.create(
                user=request.user,
                location=point,
                address=address,
                city=city,
                country=country,
                name=name,
                location_type=location_type,
                neighborhood=neighborhood,
                building_number=building_number,
                apartment_number=apartment_number,
                floor_number=floor_number,
                landmark=landmark,
                additional_details=additional_details,
                is_primary=bool(is_primary)
            )
            
            serializer = self.get_serializer(location)
            return Response({
                'success': True,
                'message': 'تم حفظ الموقع بنجاح',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response(
                {"error": f"الإحداثيات يجب أن تكون أرقاماً صحيحة: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"حدث خطأ: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['delete'], url_path='delete-my-location')
    def delete_my_location(self, request, pk=None):
        """حذف موقع محدد للمستخدم"""
        try:
            location = get_object_or_404(UserLocation, id=pk, user=request.user)
            location.delete()
            return Response(
                {"message": "تم حذف الموقع بنجاح"},
                status=status.HTTP_204_NO_CONTENT
            )
        except UserLocation.DoesNotExist:
            return Response(
                {"error": "الموقع غير موجود أو لا تملك صلاحية حذفه"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['delete'], url_path='delete-all-my-locations')
    def delete_all_my_locations(self, request):
        """حذف جميع مواقع المستخدم"""
        try:
            count, _ = UserLocation.objects.filter(user=request.user).delete()
            return Response({
                "message": f"تم حذف {count} موقع بنجاح"
            }, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {"error": f"حدث خطأ أثناء الحذف: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='nearby', permission_classes=[])
    def nearby(self, request):
        """
        البحث عن مواقع قريبة من lat/lng ضمن نصف قطر محدد (km).
        ?lat=..&lng=..&radius=..&max_results=..
        """
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = request.query_params.get('radius', 10)  # افتراضي 10 كم
        max_results = request.query_params.get('max_results', 20)  # افتراضي 20 نتيجة

        if not lat or not lng:
            return Response(
                {"error": "خط العرض وخط الطول مطلوبان"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_point = Point(float(lng), float(lat), srid=4326)
            radius = float(radius)
            max_results = int(max_results)
        except ValueError:
            return Response(
                {"error": "الإحداثيات ونصف القطر يجب أن تكون أرقاماً صحيحة"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # البحث عن المواقع القريبة - فقط العمال (workers)
        nearby_locations = UserLocation.objects.filter(user__role='worker').annotate(
            distance=Distance('location', user_point)
        ).filter(
            location__distance_lte=(user_point, D(km=radius)),
            location__isnull=False
        ).select_related('user').order_by('distance')[:max_results]

        # تنسيق النتائج
        results = []
        for location in nearby_locations:
            results.append({
                'id': location.id,
                'user': {
                    'id': location.user.id,
                    'username': location.user.username,
                    'first_name': location.user.first_name,
                    'last_name': location.user.last_name,
                    'role': location.user.role,
                    'email': location.user.email,
                    'rating': getattr(location.user, 'average_rating', 0),  # إضافة التقييم
                    'price': getattr(location.user, 'hourly_rate', 0)  # إضافة السعر
                },
                'lat': location.location.y,
                'lng': location.location.x,
                'address': location.address,
                'city': location.city,
                'country': location.country,
                'distance_km': round(location.distance.km, 2),
                'created_at': location.created_at
            })

        return Response(results)

    @action(detail=False, methods=['get'], url_path='stats')
    def location_stats(self, request):
        """إحصائيات مواقع المستخدم"""
        user_locations = UserLocation.objects.filter(user=request.user)
        
        stats = {
            'total_locations': user_locations.count(),
            'latest_location': None,
            'cities': list(user_locations.exclude(city__isnull=True)
                          .exclude(city='')
                          .values_list('city', flat=True)
                          .distinct())
        }
        
        # آخر موقع
        latest = user_locations.order_by('-created_at').first()
        if latest:
            stats['latest_location'] = {
                'lat': latest.location.y,
                'lng': latest.location.x,
                'address': latest.address,
                'created_at': latest.created_at
            }
        
        return Response(stats)

    @action(detail=False, methods=['get'], url_path='search-workers', permission_classes=[])
    def search_workers(self, request):
        """
        البحث المحسن عن العمال القريبين مع تصفية حسب نوع الخدمة
        ?lat=..&lng=..&radius=..&service_type=..&q=..&max_results=..
        """
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = float(request.query_params.get('radius', 20))  # زيادة النطاق الافتراضي
        service_type = request.query_params.get('service_type')
        q = request.query_params.get('q', '')  # نص البحث
        max_results = int(request.query_params.get('max_results', 100))  # زيادة عدد النتائج

        if not lat or not lng:
            return Response(
                {"error": "خط العرض وخط الطول مطلوبان"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            search_point = Point(float(lng), float(lat), srid=4326)
        except (ValueError, TypeError):
            return Response(
                {"error": "الإحداثيات يجب أن تكون أرقاماً صحيحة"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # البحث الأساسي عن العمال القريبين
        nearby_workers_query = UserLocation.objects.filter(
            user__role='worker',
            location__isnull=False
        ).annotate(
            distance=Distance('location', search_point)
        ).filter(
            location__distance_lte=(search_point, D(km=radius))
        ).select_related('user')

        # إضافة تصفية الخدمات إذا تم تحديد نوع الخدمة
        if service_type:
            # استيراد النماذج المطلوبة
            from services.models import Service, ServiceCategory
            from accounts.models import WorkerProfile
            from django.db.models import Q
            
            # الحصول على معرفات العمال من خلال الخدمات الموجودة
            worker_ids_with_service = set()
            
            try:
                # محاولة البحث بمعرف الفئة
                service_type_int = int(service_type)
                worker_ids_with_service.update(
                    Service.objects.filter(
                        category_id=service_type_int,
                        is_active=True,
                        is_deleted=False,
                        provider__isnull=False
                    ).values_list('provider_id', flat=True).distinct()
                )
            except (ValueError, TypeError):
                # البحث بالاسم إذا لم يكن رقماً
                worker_ids_with_service.update(
                    Service.objects.filter(
                        category__name__icontains=service_type,
                        is_active=True,
                        is_deleted=False,
                        provider__isnull=False
                    ).values_list('provider_id', flat=True).distinct()
                )
            
            # البحث أيضاً في ملفات العمال الشخصية
            profile_worker_ids = set()
            
            # إنشاء خريطة للكلمات المفتاحية حسب فئة الخدمة
            try:
                category = ServiceCategory.objects.get(id=int(service_type))
                category_keywords = {
                    'Electricians': ['electrical', 'electric', 'كهرباء', 'كهربائي'],
                    'Plumbers': ['plumbing', 'plumber', 'سباكة', 'سباك'],
                    'Carpenters': ['carpentry', 'carpenter', 'نجارة', 'نجار'],
                    'Painters': ['painting', 'painter', 'دهان', 'دهانات'],
                    'Cleaning Services': ['cleaning', 'clean', 'تنظيف', 'نظافة'],
                    'Gardening': ['gardening', 'garden', 'بستنة', 'حدائق'],
                    # Add Arabic category names
                    'كهرباء': ['electrical', 'electric', 'كهرباء', 'كهربائي'],
                    'سباكة': ['plumbing', 'plumber', 'سباكة', 'سباك'],
                    'نجارة': ['carpentry', 'carpenter', 'نجارة', 'نجار'],
                    'دهان': ['painting', 'painter', 'دهان', 'دهانات'],
                    'تنظيف': ['cleaning', 'clean', 'تنظيف', 'نظافة'],
                    'تكييف': ['air conditioning', 'ac', 'تكييف', 'مكيف'],
                    'صيانة أجهزة': ['maintenance', 'repair', 'صيانة', 'أجهزة'],
                    'تركيب أثاث': ['furniture', 'installation', 'تركيب', 'أثاث'],
                    'نقل أثاث': ['moving', 'transport', 'نقل', 'أثاث'],
                    'حدادة': ['welding', 'metalwork', 'حدادة', 'حداد'],
                    'بلاط': ['tiling', 'tiles', 'بلاط', 'سيراميك'],
                    'جص': ['plastering', 'gypsum', 'جص', 'جبس'],
                    'خدمات عامة': ['general', 'services', 'خدمات', 'عامة']
                }
                
                keywords = category_keywords.get(category.name, [])
                if keywords:
                    # البحث في ملفات العمال الشخصية باستخدام الكلمات المفتاحية
                    for keyword in keywords:
                        profile_workers = WorkerProfile.objects.filter(
                            Q(skills__icontains=keyword) |
                            Q(job_title__icontains=keyword) |
                            Q(services_provided__icontains=keyword)
                        ).values_list('user_id', flat=True)
                        profile_worker_ids.update(profile_workers)
                        
            except (ServiceCategory.DoesNotExist, ValueError):
                # البحث النصي في ملفات العمال الشخصية
                profile_workers = WorkerProfile.objects.filter(
                    Q(skills__icontains=service_type) |
                    Q(job_title__icontains=service_type) |
                    Q(services_provided__icontains=service_type)
                ).values_list('user_id', flat=True)
                profile_worker_ids.update(profile_workers)
            
            # دمج معرفات العمال من الخدمات والملفات الشخصية
            all_worker_ids = worker_ids_with_service.union(profile_worker_ids)
            
            if all_worker_ids:
                nearby_workers_query = nearby_workers_query.filter(
                    user_id__in=all_worker_ids
                )
            else:
                # إذا لم يتم العثور على عمال، إرجاع نتيجة فارغة
                nearby_workers_query = nearby_workers_query.none()

        # إضافة البحث النصي إذا تم توفيره
        if q.strip():
            from django.db.models import Q
            from accounts.models import WorkerProfile
            
            # Search in location fields
            location_search = Q(
                Q(user__first_name__icontains=q) |
                Q(user__last_name__icontains=q) |
                Q(user__username__icontains=q) |
                Q(address__icontains=q) |
                Q(city__icontains=q) |
                Q(neighborhood__icontains=q)
            )
            
            # Search in worker profile fields
            profile_search = Q()
            try:
                profile_workers = WorkerProfile.objects.filter(
                    Q(skills__icontains=q) |
                    Q(job_title__icontains=q) |
                    Q(services_provided__icontains=q)
                ).values_list('user_id', flat=True)
                
                if profile_workers:
                    profile_search = Q(user_id__in=profile_workers)
            except:
                pass
            
            # Combine both searches
            nearby_workers_query = nearby_workers_query.filter(location_search | profile_search)

        # ترتيب النتائج وتحديد العدد الأقصى
        nearby_workers = nearby_workers_query.order_by('distance')[:max_results]

        # تنسيق النتائج مع معلومات الخدمات والملف الشخصي
        results = []
        for location in nearby_workers:
            # الحصول على خدمات العامل
            from services.models import Service
            from accounts.models import WorkerProfile
            
            worker_services = Service.objects.filter(
                provider=location.user,
                is_active=True,
                is_deleted=False
            ).select_related('category')

            # حساب متوسط التقييم
            from django.db.models import Avg
            avg_rating = worker_services.aggregate(
                avg_rating=Avg('reviews__score')
            )['avg_rating'] or 0

            # تجميع معلومات الخدمات
            services_info = []
            for service in worker_services:
                services_info.append({
                    'id': service.id,
                    'title': service.title,
                    'description': service.description,
                    'category': service.category.name if service.category else None,
                    'base_price': float(service.price) if service.price else 0,
                    'rating': avg_rating
                })

            # الحصول على معلومات الملف الشخصي للعامل
            worker_profile_info = None
            try:
                worker_profile = WorkerProfile.objects.get(user=location.user)
                if worker_profile.job_title or worker_profile.skills or worker_profile.services_provided:
                    worker_profile_info = {
                        'job_title': worker_profile.job_title or '',
                        'skills': worker_profile.skills or '',
                        'services_provided': worker_profile.services_provided or '',
                        'experience_years': worker_profile.experience_years or 0,
                        'hourly_rate': float(worker_profile.hourly_rate) if worker_profile.hourly_rate else 0,
                        'estimated_price': float(worker_profile.estimated_price) if worker_profile.estimated_price else 0,
                    }
            except WorkerProfile.DoesNotExist:
                pass

            # إذا لم يكن للعامل خدمات ولكن لديه ملف شخصي، أنشئ خدمة افتراضية من الملف الشخصي
            if not services_info and worker_profile_info:
                services_info.append({
                    'id': f'profile_{location.user.id}',
                    'title': worker_profile_info['job_title'] or 'خدمات عامة',
                    'description': worker_profile_info['services_provided'] or 'خدمات متنوعة حسب المهارات',
                    'category': 'خدمات عامة',
                    'base_price': worker_profile_info['hourly_rate'] or worker_profile_info['estimated_price'] or 0,
                    'rating': 0,
                    'source': 'profile'  # تمييز أن هذه من الملف الشخصي
                })

            # تخطي العمال بدون خدمات أو ملف شخصي مكتمل
            if not services_info:
                continue

            # إضافة النتيجة
            worker_result = {
                'id': location.id,
                'user_id': location.user.id,
                'provider': {
                    'id': location.user.id,
                    'username': location.user.username,
                    'first_name': location.user.first_name,
                    'last_name': location.user.last_name,
                    'email': location.user.email,
                    'role': location.user.role,
                },
                'location': {
                    'lat': location.location.y,
                    'lng': location.location.x,
                    'address': location.address,
                    'city': location.city,
                    'country': location.country,
                    'neighborhood': location.neighborhood,
                    'building_number': location.building_number,
                    'apartment_number': location.apartment_number,
                    'floor_number': location.floor_number,
                    'landmark': location.landmark,
                    'additional_details': location.additional_details,
                },
                'distance_km': round(location.distance.km, 2),
                'services': services_info,
                'services_count': len(services_info),
                'rating': round(avg_rating, 1) if avg_rating else 0,
                'worker_profile': worker_profile_info,  # إضافة معلومات الملف الشخصي
                'created_at': location.created_at,
                'search_metadata': {
                    'matched_service_type': service_type,
                    'search_query': q,
                    'search_radius': radius,
                    'search_location': {'lat': float(lat), 'lng': float(lng)}
                }
            }
            
            results.append(worker_result)

        # إضافة إحصائيات البحث
        distances = [r['distance_km'] for r in results] if results else []
        search_stats = {
            'total_results': len(results),
            'search_radius_km': radius,
            'service_type_filter': service_type,
            'text_search': q.strip() if q.strip() else None,
            'search_location': {'lat': float(lat), 'lng': float(lng)},
            'max_distance_km': max(distances) if distances else 0,
            'min_distance_km': min(distances) if distances else 0,
        }

        return Response({
            'results': results,
            'stats': search_stats,
            'message': f'تم العثور على {len(results)} عامل في نطاق {radius} كم'
        })

    @action(detail=False, methods=['get'], url_path='search-providers', permission_classes=[])
    def search_providers(self, request):
        """
        البحث عن مزودي الخدمة بالاسم
        ?lat=..&lng=..&radius=..&q=..&max_results=..
        """
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = float(request.query_params.get('radius', 50))  # نطاق أوسع للبحث بالاسم
        q = request.query_params.get('q', '').strip()  # نص البحث
        max_results = int(request.query_params.get('max_results', 50))

        if not lat or not lng:
            return Response(
                {"error": "خط العرض وخط الطول مطلوبان"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not q:
            return Response(
                {"error": "نص البحث مطلوب"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            search_point = Point(float(lng), float(lat), srid=4326)
        except (ValueError, TypeError):
            return Response(
                {"error": "الإحداثيات يجب أن تكون أرقاماً صحيحة"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # البحث عن العمال القريبين بالاسم
        from django.db.models import Q
        
        nearby_workers = UserLocation.objects.filter(
            user__role='worker',
            location__isnull=False
        ).annotate(
            distance=Distance('location', search_point)
        ).filter(
            location__distance_lte=(search_point, D(km=radius))
        ).filter(
            Q(user__first_name__icontains=q) |
            Q(user__last_name__icontains=q) |
            Q(user__username__icontains=q) |
            Q(name__icontains=q) |
            Q(address__icontains=q) |
            Q(city__icontains=q) |
            Q(neighborhood__icontains=q)
        ).select_related('user').order_by('distance')[:max_results]

        # تنسيق النتائج
        results = []
        for location in nearby_workers:
            # الحصول على معلومات الملف الشخصي
            from accounts.models import WorkerProfile
            try:
                worker_profile = WorkerProfile.objects.get(user=location.user)
                profile_info = {
                    'job_title': worker_profile.job_title,
                    'skills': worker_profile.skills,
                    'services_provided': worker_profile.services_provided,
                    'experience_years': worker_profile.experience_years,
                    'hourly_rate': worker_profile.hourly_rate,
                    'estimated_price': worker_profile.estimated_price,
                    'neighborhood': worker_profile.neighborhood
                }
            except WorkerProfile.DoesNotExist:
                profile_info = {}

            # الحصول على خدمات العامل
            from services.models import Service
            worker_services = Service.objects.filter(
                provider=location.user,
                is_active=True,
                is_deleted=False
            ).select_related('category')

            # تجميع معلومات الخدمات
            services_info = []
            for service in worker_services:
                services_info.append({
                    'id': service.id,
                    'title': service.title,
                    'description': service.description,
                    'category': service.category.name if service.category else 'غير محدد',
                    'base_price': float(service.price) if service.price else 0,
                    'rating': 0,  # يمكن إضافة نظام التقييمات لاحقاً
                    'source': 'service'
                })

            # إنشاء خدمة افتراضية من الملف الشخصي إذا لم توجد خدمات
            if not services_info and profile_info.get('job_title'):
                services_info.append({
                    'id': f'profile_{location.user.id}',
                    'title': profile_info['job_title'],
                    'description': profile_info.get('services_provided', 'خدمات متنوعة'),
                    'category': 'خدمات عامة',
                    'base_price': float(profile_info.get('hourly_rate', 0)) if profile_info.get('hourly_rate') else 0,
                    'rating': 0,
                    'source': 'profile'
                })

            # تنسيق النتيجة
            worker_result = {
                'id': location.id,
                'user_id': location.user.id,
                'provider': {
                    'id': location.user.id,
                    'username': location.user.username,
                    'first_name': location.user.first_name,
                    'last_name': location.user.last_name,
                    'email': location.user.email,
                    'role': location.user.role
                },
                'location': {
                    'lat': location.lat,
                    'lng': location.lng,
                    'address': location.address,
                    'city': location.city,
                    'country': location.country,
                    'neighborhood': location.neighborhood,
                    'building_number': location.building_number,
                    'apartment_number': location.apartment_number,
                    'floor_number': location.floor_number,
                    'landmark': location.landmark,
                    'additional_details': location.additional_details
                },
                'distance_km': round(location.distance.km, 2),
                'services': services_info,
                'services_count': len(services_info),
                'rating': 0,  # يمكن إضافة نظام التقييمات لاحقاً
                'worker_profile': profile_info,
                'created_at': location.created_at.isoformat(),
                'search_metadata': {
                    'matched_query': q,
                    'search_radius': radius,
                    'search_location': {
                        'lat': float(lat),
                        'lng': float(lng)
                    }
                }
            }
            results.append(worker_result)

        # إحصائيات البحث
        search_stats = {
            'total_results': len(results),
            'search_radius_km': radius,
            'search_query': q,
            'search_location': {
                'lat': float(lat),
                'lng': float(lng)
            },
            'max_distance_km': max([r['distance_km'] for r in results]) if results else 0,
            'min_distance_km': min([r['distance_km'] for r in results]) if results else 0
        }

        return Response({
            'results': results,
            'stats': search_stats,
            'message': f'تم العثور على {len(results)} مزود خدمة بالاسم "{q}" في نطاق {radius} كم'
        })