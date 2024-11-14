import React, { useEffect } from 'react'
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/navbar/Navbar'
import Cookies from 'js-cookie'
import { parseJWT } from '../utils/jwtParse'
import { useStore } from '../store/store'
import { TOKEN_EXPIRY_IN_HOURS } from '../utils/constants'
import Swal from 'sweetalert2'

function MainLayout() {
    const navigate = useNavigate()
    const [queryParameters] = useSearchParams()
    const paramsToken = queryParameters.get('token')
    const cookieToken = Cookies.get("user-token")

    const updateUser = useStore((state) => state.updateUser)

    useEffect(() => {
        const token = paramsToken || cookieToken;

        if (!token || token === "undefined") {
            navigate("/login");
            return;
        }

        const user = parseJWT(token);
        const { name, department, id } = user;
        if (user) {
            updateUser({ id: id, name: name, department: department });
        }
        if (!cookieToken || (paramsToken && paramsToken !== cookieToken)) {
            setTokenWithExpiry(token, TOKEN_EXPIRY_IN_HOURS);
        }
    }, [paramsToken, cookieToken, navigate, updateUser]);

    useEffect(() => {
        const checkTokenExpiry = () => {
            const tokenData = getTokenWithExpiry();

            if (tokenData) {
                const { expiresIn } = tokenData;
                const adjustedTime = Math.floor(expiresIn);

                // If token expires in 30 minutes or less, show Swal alert
                if (expiresIn <= 30) {
                    Swal.fire({
                        title: "Session Expiry Warning",
                        text: `Your session will expire in less than ${adjustedTime} minutes. Please logout and log back in.`,
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Log out",
                        cancelButtonText: "Stay",
                    }).then((result) => {
                        if (result.isConfirmed) {
                            Cookies.remove("user-token");
                            Cookies.remove("token-expiry");
                            updateUser({});
                            navigate("/login");
                        }
                    });

                    return 5; // Reduce the interval to 5 minutes if expiry is near
                }
                if (expiresIn <= 120) {
                    return 35;
                }
                return 60; // Check every 60 minutes normally
            } else {
                // Token is invalid or expired, redirect to login
                Cookies.remove("user-token");
                Cookies.remove("token-expiry");
                updateUser({});
                navigate("/login");
                return null;
            }
        };

        // Initialize interval based on token status
        let intervalTime = checkTokenExpiry();
        let intervalId;

        const startInterval = (time) => {
            intervalId = setInterval(() => {
                const newIntervalTime = checkTokenExpiry();
                if (newIntervalTime !== time) {
                    clearInterval(intervalId);
                    startInterval(newIntervalTime);
                }
            }, time * 60 * 1000); // Convert minutes to milliseconds
        };

        if (intervalTime) {
            startInterval(intervalTime);
        }

        return () => clearInterval(intervalId); // Clean up on unmount
    }, [navigate, updateUser]);

    // Set token in cookies.
    const setTokenWithExpiry = (token, expiryHours) => {
        Cookies.set("user-token", token, { expires: expiryHours / 24 });

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiryHours);

        Cookies.set("token-expiry", expiresAt.toISOString(), {
            expires: expiryHours / 24,
        });
    };


    const getTokenWithExpiry = () => {
        const token = Cookies.get("user-token");
        const expiry = Cookies.get("token-expiry");

        if (!token || !expiry) return null;

        const expiryDate = new Date(expiry);
        const currentTime = new Date();

        if (currentTime > expiryDate) {
            // Token expired
            Cookies.remove("user-token");
            Cookies.remove("token-expiry");
            return null;
        }

        return {
            token,
            expiresIn: (expiryDate - currentTime) / 1000 / 60, // Remaining time in minutes
        };
    };

    return (
        <div>
            <Navbar />
            <main className="">
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout
