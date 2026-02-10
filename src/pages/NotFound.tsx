import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../core/utils/constants'

const styles = `
  body {
    background-image: url('/assets/media/auth/bg1.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  [data-bs-theme="dark"] body {
    background-image: url('/assets/media/auth/bg3-dark.jpg');
  }
`;

const NotFound = () => {
    const { t } = useTranslation()

    return (
        <>
            <style>{styles}</style>
            <div className="d-flex flex-column flex-root">
                <div className="d-flex flex-column flex-center flex-column-fluid">
                    <div className="d-flex flex-column flex-center text-center p-10">
                        <div className="card card-flush w-lg-650px py-5">
                            <div className="card-body py-15 py-lg-20">
                                <h1 className="fw-bolder fs-2hx text-gray-900 mb-4">Oops!</h1>
                                <div className="fw-semibold fs-6 text-gray-500 mb-7">
                                    {t('we_cant_find_that_page.')}
                                </div>
                                <div className="mb-3">
                                    <img
                                        src="/assets/media/auth/404-error.png"
                                        className="mw-100 mh-300px theme-light-show"
                                        alt="404 error"
                                    />
                                    <img
                                        src="/assets/media/auth/404-error-dark.png"
                                        className="mw-100 mh-300px theme-dark-show"
                                        alt="404 error"
                                    />
                                </div>
                                <div className="mb-0">
                                    <Link to={ROUTES.DASHBOARD} className="btn btn-sm btn-primary">
                                        {t('Return Home')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotFound;