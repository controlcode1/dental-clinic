import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-dark-bg">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8 scrollbar-custom overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
