import type { ReactNode } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

interface MainLayoutProps {
    children: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="d-flex flex-column flex-root">
            <div className="page d-flex flex-row flex-column-fluid">
                <Sidebar />
                <div className="wrapper d-flex flex-column flex-row-fluid" id="kt_wrapper">
                    <Navbar />
                    <div className="content d-flex flex-column flex-column-fluid" id="kt_content">
                        {/* Content */}
                        <div className="post d-flex flex-column-fluid" id="kt_post">
                            <div id="kt_content_container" className="container-fluid">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MainLayout