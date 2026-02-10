import LoginForm from '../components/LoginForm'
import { useTranslation } from 'react-i18next'

const styles = `
  body {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-content: stretch;
    justify-content: space-evenly;
    align-items: stretch;
    margin: 0;
  }

  @media (min-width: 992px) {
    .auth-aside {
      min-height: 100vh;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
  }
`;

const Login = () => {
    const { t } = useTranslation()

    return (
        <>
            <style>{styles}</style>
            <div className="d-flex flex-column flex-root">
                <div className="d-flex flex-column flex-lg-row flex-column-fluid">
                    {/* ==================== LEFT: FORM ==================== */}
                    <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
                        <div className="d-flex flex-center flex-column flex-lg-row-fluid">
                            <div className="w-lg-500px p-10">
                                <LoginForm />
                            </div>
                        </div>

                        {/* ==================== FOOTER: LANG + LINKS ==================== */}
                        <div className="w-lg-500px d-flex flex-stack px-10 mx-auto">
                            {/* Links */}
                            <div className="d-flex fw-semibold text-primary fs-base gap-5">
                                <a href="#" rel="noopener">{t('terms')}</a>
                                <a href="#" rel="noopener">{t('plans')}</a>
                                <a href="#" rel="noopener">{t('contact_us')}</a>
                            </div>
                        </div>
                    </div>

                    {/* ==================== RIGHT: ASIDE ==================== */}
                    <div
                        className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2 auth-aside"
                        style={{ backgroundImage: "url('/assets/media/misc/auth-bg.png')" }}
                    >
                        <div className="d-flex flex-column flex-center py-7 py-lg-15 px-5 px-md-15 w-100">
                            <a href="#" className="mb-0 mb-lg-12">
                                <img alt="Logo" src="/assets/media/logos/custom-1.png" className="h-60px h-lg-75px" />
                            </a>
                            <img
                                className="d-none d-lg-block mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20"
                                src="/assets/media/misc/auth-screens.png"
                                alt=""
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login