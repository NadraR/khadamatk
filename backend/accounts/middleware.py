class VerificationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if (request.user.is_authenticated and 
            request.user.role == 'worker' and 
            hasattr(request.user, 'worker_profile')):
            
            # التحقق من وجود verification وحالته
            has_verification = hasattr(request.user.worker_profile, 'verification')
            is_approved = has_verification and request.user.worker_profile.verification.status == 'approved'
            
            if not is_approved:
                # استثناء مسارات التحقق والمسارات الأساسية
                if (not request.path.startswith('/api/verification/') and
                    not request.path.startswith('/api/auth/') and
                    not request.path.startswith('/admin/') and
                    not request.path.startswith('/static/') and
                    not request.path.startswith('/media/')):
                    
                    return JsonResponse({
                        'error': 'Verification required',
                        'redirect': '/verification',
                        'message': 'يجب التحقق من الهوية أولاً'
                    }, status=403)
        
        return self.get_response(request)