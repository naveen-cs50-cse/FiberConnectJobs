import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Zap, Users, CheckCircle } from 'lucide-react';
import fiberHero from '../../assets/fiber_hero.jpg';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src={fiberHero}
            alt="Fiber optic cables"
          />
          <div className="absolute inset-0 bg-gray-900/60 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            The Marketplace for <span className="text-primary-400">Fiber Professionals</span>
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            Connect telecom companies with verified fiber-optic technicians and field crews. Post jobs, map locations, and manage applications all in one place.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              to="/register"
              className="rounded-md bg-primary-600 px-8 py-3 text-base font-medium text-white shadow hover:bg-primary-500 transition-colors"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="rounded-md bg-white/10 px-8 py-3 text-base font-medium text-white hover:bg-white/20 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to deploy faster
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Built specifically for the telecom and fiber infrastructure industry, Fiber Connect streamlines the entire hiring and deployment process.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <MapPin className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                  Interactive Job Mapping
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    See exactly where work is needed. Our integrated mapping system allows technicians to find jobs closest to them instantly.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <ShieldCheck className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                  Verified Professionals
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Ensure quality and safety. We are building a robust certification vault so you know the splicers you hire are fully qualified.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Zap className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                  Instant Applications
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    No more endless emails. Technicians apply with one click, and companies can review, accept, or reject directly from their dashboard.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">About Fiber Connect</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The fiber optic industry is growing at an unprecedented rate, but finding reliable, skilled technicians has remained a major bottleneck for infrastructure companies. Fiber Connect was built to bridge this gap. By combining modern mapping technology with a dedicated professional network, we make building the future of connectivity easier for everyone.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Section (TBD) */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our pricing model is currently being finalized to ensure the best value for both independent contractors and large enterprise companies.
            </p>
          </div>
          <div className="mt-16 flex justify-center">
            <div className="rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10 max-w-md w-full bg-white shadow-xl">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">Early Access</h3>
              <p className="mt-4 text-sm leading-6 text-gray-600">Join now while we are in Beta to lock in exclusive rates and free features.</p>
              <div className="mt-6 flex items-baseline justify-center gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-gray-900">$0</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
              </div>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-primary-600" /> Post unlimited jobs</li>
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-primary-600" /> Map integration</li>
                <li className="flex gap-x-3"><CheckCircle className="h-6 w-5 flex-none text-primary-600" /> Direct applications</li>
              </ul>
              <Link to="/register" className="mt-8 block w-full rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
