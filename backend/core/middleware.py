import logging
from django.http import JsonResponse
from django.db import connection
from django.db.utils import OperationalError
import time

logger = logging.getLogger(__name__)

class DatabaseErrorMiddleware:
    """
    Middleware to handle database connection errors and retry logic
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.max_retries = 3
        self.retry_delay = 1  # seconds

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        """
        Handle database connection errors
        """
        if isinstance(exception, OperationalError):
            error_msg = str(exception)
            
            # Check if it's an SSL connection error
            if 'SSL SYSCALL error' in error_msg or 'EOF detected' in error_msg:
                logger.warning(f"Database SSL connection error: {error_msg}")
                
                # Try to close the connection and retry
                try:
                    connection.close()
                    time.sleep(self.retry_delay)
                    
                    # Return a retry response
                    return JsonResponse({
                        'error': 'Database connection temporarily unavailable',
                        'message': 'Please try again in a moment',
                        'retry_after': self.retry_delay
                    }, status=503)
                    
                except Exception as retry_error:
                    logger.error(f"Failed to retry database connection: {retry_error}")
                    return JsonResponse({
                        'error': 'Database connection failed',
                        'message': 'Please try again later'
                    }, status=503)
            
            # Handle other database errors
            elif 'server closed the connection' in error_msg:
                logger.warning(f"Database connection closed: {error_msg}")
                try:
                    connection.close()
                    return JsonResponse({
                        'error': 'Database connection lost',
                        'message': 'Please refresh and try again'
                    }, status=503)
                except Exception as close_error:
                    logger.error(f"Failed to close database connection: {close_error}")
                    return JsonResponse({
                        'error': 'Database connection error',
                        'message': 'Please try again later'
                    }, status=503)
        
        # Let other exceptions pass through
        return None

