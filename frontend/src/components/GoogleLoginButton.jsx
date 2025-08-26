// import React, { useState } from "react";
// import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
// import { authService } from "../services/authService";
// import { useNavigate } from "react-router-dom";
// import "./GoogleLoginButton.css";

// const GoogleLoginButton = ({ onSuccess, onError, disabled, userType = 'client', mode = 'component' }) => {
//   const navigate = useNavigate();
//   const [isLoading, setIsLoading] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   const redirectAfterLogin = (userData) => {
//     if (!userData?.hasLocation) {
//       navigate('/location');
//     } else if (userData?.role === 'worker') {
//       navigate('/worker-dashboard');
//     } else {
//       navigate('/client-dashboard');
//     }
//   };

//   const handleLoginSuccess = async (tokenResponse) => {
//     setIsLoading(true);
//     try {
//       const idToken = tokenResponse?.id_token || tokenResponse?.credential;
//       if (!idToken) throw new Error('لم يتم استلام ID Token من Google');

//       const result = await authService.googleLogin(idToken, userType);
//       if (result) {
//         onSuccess?.(result);
//         redirectAfterLogin(result);
//       } else {
//         onError?.('فشل تسجيل الدخول بواسطة Google');
//       }
//     } catch (error) {
//       onError?.(error.message || 'فشل تسجيل الدخول بواسطة Google');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const hookLogin = useGoogleLogin({
//     onSuccess: handleLoginSuccess,
//     onError: (error) => {
//       onError?.(error.error_description || 'فشل تسجيل الدخول بواسطة Google');
//     },
//   });

//   if (mode === 'component') {
//     return (
//       <div className="google-login-container">
//         <div className="divider">
//           <span>أو</span>
//         </div>
        
//         <div 
//           className={`custom-google-button ${disabled ? 'disabled' : ''} ${isHovered ? 'hovered' : ''}`}
//           onMouseEnter={() => setIsHovered(true)}
//           onMouseLeave={() => setIsHovered(false)}
//         >
//           {isLoading ? (
//             <div className="loading-spinner">
//               <div className="spinner"></div>
//               <span>جاري تسجيل الدخول...</span>
//             </div>
//           ) : (
//             <GoogleLogin
//               onSuccess={handleLoginSuccess}
//               onError={() => onError?.('فشل تسجيل الدخول بواسطة Google')}
//               useOneTap={false}
//               type="icon"
//               shape="circle"
//               theme="filled_blue"
//               size="large"
//               text="signin_with"
//               disabled={disabled}
//             />
//           )}
//         </div>
        
//         <div className="login-info">
//           <h3>تسجيل الدخول باستخدام Google</h3>
//           <p>سجل دخولك بسهولة وأمان باستخدام حساب Google الخاص بك</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <button
//       onClick={hookLogin}
//       disabled={disabled || isLoading}
//       className={`google-login-button ${isLoading ? 'loading' : ''}`}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       {isLoading ? (
//         <div className="button-loading-spinner"></div>
//       ) : (
//         <>
//           <img 
//             src="https://developers.google.com/identity/images/g-logo.png" 
//             alt="Google" 
//             width="20" 
//             height="20" 
//           />
//           تسجيل الدخول بـ Google
//         </>
//       )}
//     </button>
//   );
// };

// export default GoogleLoginButton;