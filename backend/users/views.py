from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from .models import PasswordReset
from .serializers import ForgotPasswordSerializer, ResetPasswordSerializer

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'message': 'If account exists, reset link will be sent'}, status=status.HTTP_200_OK)

        PasswordReset.objects.filter(user=user, used=False).delete()

        token = get_random_string(length=64)
        expires_at = timezone.now() + timedelta(hours=1)
        
        PasswordReset.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        reset_link = f"http://localhost:4200/reset-password?token={token}"
        
        print(f"\n{'='*50}")
        print(f"RESET PASSWORD LINK FOR {email}:")
        print(reset_link)
        print(f"{'='*50}\n")
        
        return Response({'message': 'Reset link sent to your email'}, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            reset = PasswordReset.objects.get(
                token=token, 
                used=False, 
                expires_at__gt=timezone.now()
            )
        except PasswordReset.DoesNotExist:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = reset.user
        user.set_password(new_password)
        user.save()
        
        reset.used = True
        reset.save()
        
        return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)