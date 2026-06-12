"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Activity, LogOut, User } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react"; // 引入 NextAuth

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession(); // 获取登录状态

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Signal", path: "/signal" },
    { name: "Detective", path: "/detective" },
    { name: "Alerts", path: "/alerts" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo 区 */}
            <div className="flex-shrink-0 flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Activity className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">Signal Hub</span>
            </div>
            
            {/* 导航页签区 */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== "/");
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 右侧登录区 (合并了 Google 登录和钱包连接) */}
          <div className="flex items-center gap-3">
            {/* 钱包连接按钮 */}
            <ConnectButton 
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }} 
            />

            {/* Google 登录状态管理 */}
            {status === "loading" ? (
              <div className="w-8 h-8 bg-gray-100 animate-pulse rounded-full" />
            ) : session ? (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <img 
                  src={session.user?.image || ""} 
                  alt="User" 
                  className="w-8 h-8 rounded-full border border-gray-200" 
                />
                <button 
                  onClick={() => signOut()}
                  className="text-gray-500 hover:text-gray-900"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => signIn("google")}
                className="ml-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}