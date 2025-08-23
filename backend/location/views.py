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
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return UserLocation.objects.select_related('user').all()
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
        """حفظ موقع جديد للمستخدم"""
        lat = request.data.get('lat')
        lng = request.data.get('lng')
        address = request.data.get('address', '')
        city = request.data.get('city', '')
        country = request.data.get('country', 'مصر')

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
            
            # إنشاء موقع جديد
            location = UserLocation.objects.create(
                user=request.user,
                location=point,
                address=address,
                city=city,
                country=country
            )
            
            serializer = self.get_serializer(location)
            return Response({
                'success': True,
                'message': 'تم حفظ الموقع بنجاح',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except ValueError:
            return Response(
                {"error": "الإحداثيات يجب أن تكون أرقاماً صحيحة"},
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

    @action(detail=False, methods=['get'], url_path='nearby')
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

        # البحث عن المواقع القريبة مع استبعاد المستخدم الحالي
        nearby_locations = UserLocation.objects.exclude(user=request.user).annotate(
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
                    'email': location.user.email
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