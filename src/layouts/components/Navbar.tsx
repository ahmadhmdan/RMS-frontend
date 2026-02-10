import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../core/hooks/useAuth'
import { useTheme } from '../../core/hooks/useTheme'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../../core/utils/constants'
import { availableLanguages } from '../../i18n'
import CalculatorModal from '../../core/components/CalculatorModal';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';

const Navbar = () => {
    const { logout, user } = useAuth()
    const { mode, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()

    const [currentTime, setCurrentTime] = useState(new Date())
    const [showCalculator, setShowCalculator] = useState(false)

    const queryClient = useQueryClient();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    // Format date and time
    const formatDateTime = (date: Date) => {
        const optionsDate: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }
        const formattedDate = date.toLocaleDateString(i18n.language, optionsDate)
        const formattedTime = date.toLocaleTimeString(i18n.language, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })

        return { formattedDate, formattedTime }
    }

    const { formattedDate, formattedTime } = formatDateTime(currentTime)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const changeLanguage = (lng: 'en' | 'ar') => {
        if (availableLanguages.includes(lng)) {
            i18n.changeLanguage(lng)
        }
    }

    const handleClearCache = () => {
        Swal.fire({
            title: t('are_you_sure'),
            text: t('clear_cache_warning'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: t('yes_clear'),
            cancelButtonText: t('cancel')
        }).then((result) => {
            if (result.isConfirmed) {
                queryClient.removeQueries();
                Swal.fire(t('cleared'), t('cache_cleared_success'), 'success');
            }
        });
    };

    return (
        <>
            <div
                id="kt_header"
                className="header align-items-stretch"
                style={{
                    backgroundColor: mode === 'light' ? '#f9f9f9' : '#0f1014'
                }}
            >
                <div className="container-fluid d-flex align-items-stretch justify-content-between">
                    {/* Left: Dashboard Title (Desktop only) */}
                    <div className="d-none d-lg-flex align-items-center">
                        <div className="d-flex flex-column">
                            <h1 className={`fs-2 fw-bold ${mode === 'light' ? 'text-gray-800 m-0' : 'text-white m-0'}`}>
                                {t('dashboard')}
                            </h1>
                            <span className={`fs-7 ${mode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                {t('Reports & Statistics')}
                            </span>
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="d-flex align-items-center d-lg-none ms-n4 me-1" title="Show aside menu">
                        <div className="btn btn-icon btn-active-color-white" id="kt_aside_mobile_toggle">
                            <i className="ki-outline ki-burger-menu fs-1"></i>
                        </div>
                    </div>

                    {/* Mobile Logo */}
                    <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
                        <Link to={ROUTES.DASHBOARD} className="d-lg-none">
                            <img alt="Logo" src="/assets/media/features-logos/typescript.png" className="h-25px" />
                        </Link>
                    </div>

                    {/* Center: Date & Time (Visible on lg and above) */}
                    <div className="d-none d-lg-flex align-items-center justify-content-center flex-grow-1" style={{ paddingRight: '20rem' }}>
                        <div className="d-flex flex-column text-center">
                            <div className={`fw-bold fs-4 ${mode === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                {formattedDate}
                            </div>
                            <div className={`fs-3 fw-bolder ${mode === 'light' ? 'text-primary' : 'text-info'}`}>
                                {formattedTime}
                            </div>
                        </div>
                    </div>

                    {/* Right: Toolbar */}
                    <div className="d-flex align-items-stretch justify-content-end flex-lg-grow-1">
                        <div className="topbar d-flex align-items-stretch flex-shrink-0">

                            {/* Calculator Button */}
                            <div className="d-flex align-items-center me-3">
                                <button
                                    className="btn btn-icon btn-active-color-primary"
                                    onClick={() => setShowCalculator(true)}
                                    title={t('calculator')}
                                >
                                    <i className="ki-outline ki-finance-calculator fs-1"></i>
                                </button>
                            </div>

                            {/* Clear Cache Button */}
                            <div className="d-flex align-items-center me-3">
                                <button
                                    className="btn btn-icon btn-active-color-primary"
                                    onClick={handleClearCache}
                                    title={t('clear_cache')}
                                >
                                    <i className="ki-outline ki-arrows-loop fs-1"></i>
                                </button>
                            </div>

                            {/* Theme Mode */}
                            <div className="d-flex align-items-center">
                                <a href="#" className="topbar-item px-3 px-lg-4"
                                    data-kt-menu-trigger="{default:'click', lg: 'hover'}"
                                    data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
                                    <i className="ki-outline ki-night-day theme-light-show fs-1"></i>
                                    <i className="ki-outline ki-moon theme-dark-show fs-1"></i>
                                </a>
                                <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-gray-500 menu-active-bg menu-state-color fw-semibold py-4 fs-base w-150px"
                                    data-kt-menu="true" data-kt-element="theme-mode-menu">
                                    <div className="menu-item px-3 my-0">
                                        <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="light" onClick={toggleTheme}>
                                            <span className="menu-icon"><i className="ki-outline ki-night-day fs-2"></i></span>
                                            <span className="menu-title">Light</span>
                                        </a>
                                    </div>
                                    <div className="menu-item px-3 my-0">
                                        <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="dark" onClick={toggleTheme}>
                                            <span className="menu-icon"><i className="ki-outline ki-moon fs-2"></i></span>
                                            <span className="menu-title">Dark</span>
                                        </a>
                                    </div>
                                    <div className="menu-item px-3 my-0">
                                        <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="system">
                                            <span className="menu-icon"><i className="ki-outline ki-screen fs-2"></i></span>
                                            <span className="menu-title">System</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* User Menu */}
                            <div className="d-flex align-items-stretch" id="kt_header_user_menu_toggle">
                                <div
                                    className="topbar-item cursor-pointer symbol px-3 px-lg-5 me-n3 me-lg-n5 symbol-30px symbol-md-35px"
                                    data-kt-menu-trigger="{default:'click', lg: 'hover'}"
                                    data-kt-menu-attach="parent"
                                    data-kt-menu-placement="bottom-end"
                                    data-kt-menu-flip="bottom"
                                >
                                    <img alt="User" src="/assets/media/avatars/blank.png" />
                                    <div className="position-absolute translate-middle bottom-0 start-75 mb-2 bg-success rounded-circle border border-4 border-body h-15px w-15px"></div>
                                </div>
                                {/* User dropdown menu remains unchanged */}
                                <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px"
                                    data-kt-menu="true">
                                    <div className="menu-item px-3">
                                        <div className="menu-content d-flex align-items-center px-3">
                                            <div className="symbol symbol-50px me-5">
                                                <img alt="User" src="/assets/media/avatars/blank.png" />
                                            </div>
                                            <div className="d-flex flex-column">
                                                <div className="fw-bold d-flex align-items-center fs-5">
                                                    {user?.username || 'User'}
                                                </div>
                                                <div className="fw-semibold text-muted fs-7">
                                                    {user?.email || 'user@example.com'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="separator my-2"></div>
                                    <div className="menu-item px-5">
                                        <Link to="/profile" className="menu-link px-5">{t('my_profile')}</Link>
                                    </div>
                                    {availableLanguages.length > 1 && (
                                        <div className="menu-item px-5" data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                                            data-kt-menu-placement="left-start">
                                            <a href="#" className="menu-link px-5">
                                                <span className="menu-title position-relative">
                                                    {t('language')}
                                                    <span className="fs-8 rounded bg-light px-3 py-2 position-absolute translate-middle-y top-50 end-0">
                                                        {i18n.language === 'en' ? t('english') : t('arabic')}
                                                        <img className="w-15px h-15px rounded-1 ms-2"
                                                            src={`/assets/media/flags/${i18n.language === 'en' ? 'united-states' : 'united-arab-emirates'}.svg`} alt="" />
                                                    </span>
                                                </span>
                                            </a>
                                            <div className="menu-sub menu-sub-dropdown w-175px py-4">
                                                {availableLanguages.includes('en') && (
                                                    <div className="menu-item px-3">
                                                        <a href="#" className="menu-link d-flex px-5" onClick={() => changeLanguage('en')}>
                                                            <span className="symbol symbol-20px me-4">
                                                                <img className="rounded-1" src="/assets/media/flags/united-states.svg" alt="" />
                                                            </span>{t('english')}
                                                        </a>
                                                    </div>
                                                )}
                                                {availableLanguages.includes('ar') && (
                                                    <div className="menu-item px-3">
                                                        <a href="#" className="menu-link d-flex px-5" onClick={() => changeLanguage('ar')}>
                                                            <span className="symbol symbol-20px me-4">
                                                                <img className="rounded-1" src="/assets/media/flags/united-arab-emirates.svg" alt="" />
                                                            </span>{t('arabic')}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className="separator my-2"></div>
                                    <div className="menu-item px-5">
                                        <a href="#" className="menu-link px-5" onClick={handleLogout}>{t('logout')}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <CalculatorModal show={showCalculator} onHide={() => setShowCalculator(false)} />
        </>
    )
}

export default Navbar