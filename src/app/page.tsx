import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="container flex items-center justify-between h-16">
          <div className="text-xl font-bold text-primary">CRM System</div>
          <div className="flex space-x-2">
            <Link href="/login">
              <Button variant="secondary" className="text-sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="text-sm">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-20 bg-gray-50">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Simple and Powerful CRM for Business Growth
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Manage your clients, track activities, and grow your business with our easy-to-use CRM system.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/register">
                  <Button className="text-base px-6 py-3">
                    Get Started for Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" className="text-base px-6 py-3">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card flex flex-col items-center text-center p-8">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-white mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Client Management</h3>
                <p className="text-gray-600">
                  Easily manage all your clients and keep track of your interactions.
                </p>
              </div>

              <div className="card flex flex-col items-center text-center p-8">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-white mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Activity Tracking</h3>
                <p className="text-gray-600">
                  Log all client activities and never miss a follow-up again.
                </p>
              </div>

              <div className="card flex flex-col items-center text-center p-8">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-white mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Powerful Insights</h3>
                <p className="text-gray-600">
                  Gain insights into your business with detailed reports and analytics.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2025 CRM System. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-light">Terms</a>
              <a href="#" className="hover:text-primary-light">Privacy</a>
              <a href="#" className="hover:text-primary-light">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}