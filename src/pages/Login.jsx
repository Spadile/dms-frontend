import React, { lazy, Suspense } from 'react'

const LoginComponent = lazy(() => import('../components/login/LoginComponent'))
function Login() {

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginComponent />
        </Suspense>
    )
}

export default Login
