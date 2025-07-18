import React from 'react';

const ComponentLibrary: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pigeon Racing Game - Component Library</h1>
          <p className="text-gray-600">Professional Tailwind CSS components for the pigeon racing game</p>
        </div>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Buttons</h2>
          <div className="card">
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary Button</button>
              <button className="btn-success">Success Button</button>
              <button className="btn-warning">Warning Button</button>
              <button className="btn-danger">Danger Button</button>
              <button className="btn-outline">Outline Button</button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <button className="btn-primary btn-sm">Small Primary</button>
              <button className="btn-primary btn-lg">Large Primary</button>
              <button className="btn-primary" disabled>Disabled</button>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Basic Card</h3>
                <p className="card-subtitle">Simple card with header</p>
              </div>
              <p className="text-gray-600">This is a basic card component with header and content.</p>
            </div>

            <div className="pigeon-card">
              <img 
                src="/assets/pigeons/1.png" 
                alt="Pigeon" 
                className="pigeon-image"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <h3 className="font-semibold text-gray-900 mb-2">Racing Pigeon</h3>
              <div className="pigeon-stats">
                <div className="pigeon-stat">
                  <span className="pigeon-stat-label">Speed:</span>
                  <span className="pigeon-stat-value">85</span>
                </div>
                <div className="pigeon-stat">
                  <span className="pigeon-stat-label">Stamina:</span>
                  <span className="pigeon-stat-value">92</span>
                </div>
              </div>
            </div>

            <div className="market-item">
              <h3 className="font-semibold text-gray-900 mb-2">Market Item</h3>
              <p className="text-gray-600 mb-4">Premium racing pigeon for sale</p>
              <div className="flex justify-between items-center">
                <span className="market-price">$1,250</span>
                <button className="btn-primary btn-sm">Buy Now</button>
              </div>
            </div>
          </div>
        </section>

        {/* Forms Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Forms</h2>
          <div className="card max-w-md">
            <form className="space-y-4">
              <div>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="Enter your email"
                />
                <p className="form-help">We'll never share your email with anyone else.</p>
              </div>
              
              <div>
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Enter your password"
                />
                <p className="form-error">Password is required</p>
              </div>
              
              <button type="submit" className="btn-primary w-full">Submit</button>
            </form>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Stat Bars</h2>
          <div className="card max-w-md space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Base Stats</span>
                <span>85%</span>
              </div>
              <div className="stat-bar">
                <div className="stat-fill-base" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Evolution</span>
                <span>92%</span>
              </div>
              <div className="stat-bar">
                <div className="stat-fill-evolution" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Warning Level</span>
                <span>45%</span>
              </div>
              <div className="stat-bar">
                <div className="stat-fill-warning" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Danger Level</span>
                <span>15%</span>
              </div>
              <div className="stat-bar">
                <div className="stat-fill-danger" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Navigation</h2>
          <div className="card">
            <div className="flex space-x-4">
              <a href="#" className="nav-link-active">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home
              </a>
              <a href="#" className="nav-link-inactive">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Racing
              </a>
              <a href="#" className="nav-link-inactive">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                  <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Market
              </a>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Badges</h2>
          <div className="card">
            <div className="flex flex-wrap gap-2">
              <span className="badge-primary">Primary</span>
              <span className="badge-success">Success</span>
              <span className="badge-warning">Warning</span>
              <span className="badge-danger">Danger</span>
              <span className="badge-gray">Gray</span>
            </div>
          </div>
        </section>

        {/* Loading Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Loading States</h2>
          <div className="card">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="loading-spinner w-6 h-6"></div>
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
                <span className="text-sm text-gray-600">Processing...</span>
              </div>
            </div>
          </div>
        </section>

        {/* Race Track Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Race Track</h2>
          <div className="card">
            <div className="race-track">
              <div className="race-lane">
                <div className="race-pigeon" style={{ left: '75%' }}></div>
              </div>
              <div className="race-lane">
                <div className="race-pigeon" style={{ left: '60%' }}></div>
              </div>
              <div className="race-lane">
                <div className="race-pigeon" style={{ left: '85%' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['primary', 'pigeon', 'success', 'warning', 'danger'].map((color) => (
              <div key={color} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900 capitalize">{color}</h3>
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div
                    key={shade}
                    className={`w-full h-8 rounded border border-gray-200 bg-${color}-${shade}`}
                    title={`${color}-${shade}`}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Animations Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Animations</h2>
          <div className="card">
            <div className="flex items-center space-x-8">
              <div className="animate-fade-in">
                <div className="w-16 h-16 bg-primary-500 rounded-lg"></div>
              </div>
              <div className="animate-slide-up">
                <div className="w-16 h-16 bg-success-500 rounded-lg"></div>
              </div>
              <div className="animate-bounce-gentle">
                <div className="w-16 h-16 bg-warning-500 rounded-lg"></div>
              </div>
              <div className="animate-pulse-slow">
                <div className="w-16 h-16 bg-danger-500 rounded-lg"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComponentLibrary; 