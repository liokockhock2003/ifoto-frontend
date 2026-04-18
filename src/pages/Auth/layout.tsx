import { Outlet } from 'react-router-dom';
import { Camera, Users, Award } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

export default function AuthLayout() {
    return (
        <div className="flex min-h-screen">
            {/* ── Left: branding panel ── */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
                style={{ backgroundImage: "url('/cam-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                {/* Dark overlay so text stays readable */}
                <div className="absolute inset-0 bg-[#680202]/0" />
                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <svg
                        viewBox="0 0 1250 830"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-label="KFK logo"
                        className="w-12 h-12 shrink-0"
                        style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
                    >
                        <path d="M360.727,257.91l6.66,-200.619l254.3,0.284l48.722,94.391l154.468,-0.547l60.119,95.614l-211.892,79.899c-55.113,21.084 -87.296,71.642 -88.19,119.978c-0.978,52.874 26.621,102.383 86.821,124.162l186.699,66.524l-43.384,135.593l-727.307,0l-35.57,-231.428l57.12,0l11.566,52.587l0,-215.081c-21.611,-7.866 -30.183,-20.626 -30.273,-36.568c-0.583,-8.671 1.683,-15.785 6.636,-21.43c5.283,-6.022 13.623,-10.372 24.822,-13.161l82.643,-154.32l26.369,0l0,-26.382l19.53,0l0,-9.876l33.135,0l0,8.858l18.416,0l0,25.76l49.855,0l-7.591,192.475l-49.258,0l0,32.382l45.348,0l-6.573,116.725l-38.617,0l0,122.684c2.234,11.686 7.821,19.26 17.303,22.056l47.932,0c-11.505,-5.897 -19.211,-13.968 -23.243,-24.139l20.855,-342.416l42.037,0l40.912,340.076c-4.57,12.788 -12.744,20.764 -23.8,24.887l34.513,0l-41.487,-378.983l-49.596,0.015Zm-296.203,294.91l31.889,210.653l707.876,0l37.48,-115.019l-723.171,0l-16.387,-95.634l-37.687,0Zm56.086,-223.656c-8.469,1.596 -13.577,4.915 -13.333,14.296c0.204,7.856 5.971,13.099 13.333,12.067l0,-26.363Zm277.48,107.069l-13.936,147.316c1.835,8.715 7.231,13.013 16.983,12.911c9.037,-0.094 14.469,-2.626 17.623,-11.614l-20.67,-148.612Zm57.072,-352.645l0.64,58.526l171.51,0l-31.21,-58.526l-140.94,0Z" fill="currentColor" />
                        <path d="M1196.815,480.653c-18.422,140.56 -152.747,206.299 -265.698,172.037l-250.906,-88.02c-57.018,-22.819 -80.802,-61.669 -81.163,-103.661c-2.074,-66.674 30.63,-107.324 89.338,-128.515l243.179,-91.051c45.677,-15.621 79.021,-10.133 104.73,-6.388c71.014,10.345 138.386,83.779 159.624,173.594c3.034,12.83 3.873,49.285 0.895,72.004Zm-381.665,-36.937c-1.738,112.041 110.667,179.443 194.11,167.412c90.293,-13.019 157.227,-98.739 151.502,-166.225c-9.062,-106.817 -76.986,-168.67 -167.352,-168.969c-94.13,-0.311 -176.685,66.253 -178.26,167.781Z" fill="currentColor" />
                        <text x="221.726" y="739.602" style={{ fontFamily: "'Times New Roman', serif", fontStyle: 'italic', fontSize: '83.561px' }} fill="currentColor">K R E <tspan x="440.707 490.24 511.131 556.094 576.984" y="739.602 739.602 739.602 739.602 739.602">A T I</tspan> F</text>
                    </svg>
                    <span className="text-2xl font-bold tracking-tight">IFoto</span>
                </div>

                {/* Hero text */}
                <div className="relative z-10 space-y-6">
                    <h1 className="text-4xl font-bold leading-tight">
                        Capture moments,<br />manage them effortlessly.
                    </h1>
                    <p className="text-white/70 text-lg leading-relaxed">
                        The official photography equipment management platform for Kelab Fotokreatif (KFK) — borrow, track and return photography gear with ease.
                    </p>

                    {/* Feature pills */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="flex items-center justify-center rounded-lg bg-white/15 p-2 shrink-0">
                                <Camera className="h-4 w-4" />
                            </div>
                            <span className="text-sm">Browse and Rent photography equipment</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="flex items-center justify-center rounded-lg bg-white/15 p-2 shrink-0">
                                <Users className="h-4 w-4" />
                            </div>
                            <span className="text-sm">Manage bookings and equipment requests</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="flex items-center justify-center rounded-lg bg-white/15 p-2 shrink-0">
                                <Award className="h-4 w-4" />
                            </div>
                            <span className="text-sm">Track inventory and rental history</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-white/40 text-xs">
                    © {new Date().getFullYear()} Kelab Fotokreatif KFK. All rights reserved.
                </p>
            </div>

            {/* ── Right: auth form ── */}
            <div className="flex w-full lg:w-1/2 flex-col overflow-y-auto bg-background px-6 py-6">
                <div className="flex justify-end">
                    <ModeToggle />
                </div>
                <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-md">
                    {/* Mobile-only logo */}
                    <div className="mb-8 flex items-center gap-2 lg:hidden">
                        <svg
                            viewBox="0 0 1250 830"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-label="KFK logo"
                            className="w-8 h-8 text-brand shrink-0"
                            style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}
                        >
                            <path d="M360.727,257.91l6.66,-200.619l254.3,0.284l48.722,94.391l154.468,-0.547l60.119,95.614l-211.892,79.899c-55.113,21.084 -87.296,71.642 -88.19,119.978c-0.978,52.874 26.621,102.383 86.821,124.162l186.699,66.524l-43.384,135.593l-727.307,0l-35.57,-231.428l57.12,0l11.566,52.587l0,-215.081c-21.611,-7.866 -30.183,-20.626 -30.273,-36.568c-0.583,-8.671 1.683,-15.785 6.636,-21.43c5.283,-6.022 13.623,-10.372 24.822,-13.161l82.643,-154.32l26.369,0l0,-26.382l19.53,0l0,-9.876l33.135,0l0,8.858l18.416,0l0,25.76l49.855,0l-7.591,192.475l-49.258,0l0,32.382l45.348,0l-6.573,116.725l-38.617,0l0,122.684c2.234,11.686 7.821,19.26 17.303,22.056l47.932,0c-11.505,-5.897 -19.211,-13.968 -23.243,-24.139l20.855,-342.416l42.037,0l40.912,340.076c-4.57,12.788 -12.744,20.764 -23.8,24.887l34.513,0l-41.487,-378.983l-49.596,0.015Zm-296.203,294.91l31.889,210.653l707.876,0l37.48,-115.019l-723.171,0l-16.387,-95.634l-37.687,0Zm56.086,-223.656c-8.469,1.596 -13.577,4.915 -13.333,14.296c0.204,7.856 5.971,13.099 13.333,12.067l0,-26.363Zm277.48,107.069l-13.936,147.316c1.835,8.715 7.231,13.013 16.983,12.911c9.037,-0.094 14.469,-2.626 17.623,-11.614l-20.67,-148.612Zm57.072,-352.645l0.64,58.526l171.51,0l-31.21,-58.526l-140.94,0Z" fill="currentColor" />
                            <path d="M1196.815,480.653c-18.422,140.56 -152.747,206.299 -265.698,172.037l-250.906,-88.02c-57.018,-22.819 -80.802,-61.669 -81.163,-103.661c-2.074,-66.674 30.63,-107.324 89.338,-128.515l243.179,-91.051c45.677,-15.621 79.021,-10.133 104.73,-6.388c71.014,10.345 138.386,83.779 159.624,173.594c3.034,12.83 3.873,49.285 0.895,72.004Zm-381.665,-36.937c-1.738,112.041 110.667,179.443 194.11,167.412c90.293,-13.019 157.227,-98.739 151.502,-166.225c-9.062,-106.817 -76.986,-168.67 -167.352,-168.969c-94.13,-0.311 -176.685,66.253 -178.26,167.781Z" fill="currentColor" />
                            <text x="221.726" y="739.602" style={{ fontFamily: "'Times New Roman', serif", fontStyle: 'italic', fontSize: '83.561px' }} fill="currentColor">K R E <tspan x="440.707 490.24 511.131 556.094 576.984" y="739.602 739.602 739.602 739.602 739.602">A T I</tspan> F</text>
                        </svg>
                        <span className="text-xl font-bold text-brand">IFoto</span>
                    </div>

                    <Outlet />
                </div>
                </div>
            </div>
        </div>
    );
}
