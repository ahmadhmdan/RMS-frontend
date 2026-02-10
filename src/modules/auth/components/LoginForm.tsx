import { useAuth } from '../../../core/hooks/useAuth'
import { authService } from '../services/auth.service'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { ROUTES } from '../../../core/utils/constants'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'

interface LoginFormProps {
    redirectTo?: string
}

const LoginForm = ({ redirectTo = ROUTES.DASHBOARD }: LoginFormProps) => {
    const { t } = useTranslation()
    const { login } = useAuth()
    const navigate = useNavigate()

    const validationSchema = Yup.object({
        username: Yup.string().required(t('username_required')),
        password: Yup.string().required(t('password_required')),
    })

    return (
        <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    const response = await authService.login(values)
                    login(response.data.access_token, response.data.user)
                    navigate(redirectTo)
                } catch (err: any) {
                    Swal.fire({
                        icon: 'error',
                        title: t('login_failed'),
                        text: err.response?.data?.message || t('invalid_credentials'),
                        confirmButtonText: t('Ok'),
                    })
                } finally {
                    setSubmitting(false)
                }
            }}
        >
            {({ isSubmitting, touched, errors }) => (
                <Form
                    className="form w-100"
                    noValidate
                    id="kt_sign_in_form"
                >
                    {/* Heading */}
                    <div className="text-center mb-11">
                        <h1 className="text-gray-900 fw-bolder mb-3">{t('sign_in')}</h1>
                        <div className="text-gray-500 fw-semibold fs-6">{t('rms_system')}</div>
                    </div>

                    {/* username */}
                    <div className="fv-row mb-8">
                        <Field
                            type="text"
                            placeholder={t('username')}
                            name="username"
                            autoComplete="off"
                            className={`form-control bg-transparent ${touched.username && errors.username ? 'is-invalid' : ''
                                }`}
                        />
                        <ErrorMessage name="username">
                            {msg => (
                                <div className="fv-plugins-message-container text-danger fs-7 mt-1">
                                    {msg}
                                </div>
                            )}
                        </ErrorMessage>
                    </div>

                    {/* Password */}
                    <div className="fv-row mb-3">
                        <Field
                            type="password"
                            placeholder={t('password')}
                            name="password"
                            autoComplete="off"
                            className={`form-control bg-transparent ${touched.password && errors.password ? 'is-invalid' : ''
                                }`}
                        />
                        <ErrorMessage name="password">
                            {msg => (
                                <div className="fv-plugins-message-container text-danger fs-7 mt-1">
                                    {msg}
                                </div>
                            )}
                        </ErrorMessage>
                    </div>

                    {/* Forgot Password */}
                    <div className="d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8">
                        <div></div>
                        <a href="#" className="link-primary">
                            {t('forgot_password')}
                        </a>
                    </div>

                    {/* Submit Button */}
                    <div className="d-grid mb-10">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            <span className="indicator-label">{t('sign_in')}</span>
                            {isSubmitting && (
                                <span className="indicator-progress">
                                    {t('please_wait')}...
                                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                                </span>
                            )}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    )
}

export default LoginForm