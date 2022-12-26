import Link from "next/link";
import { useAuthDispatch, useAuthState } from "../context/auth";
import axios from "axios";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";

const NavBar: React.FC = () => {
    const { loading, authenticated } = useAuthState();
    const dispatch = useAuthDispatch();
    const handleLogout = () => {
        axios
            .post("/auth/logout")
            .then(() => {
                dispatch("LOGOUT");
                window.location.reload();
            })
            .catch((err) => console.log(err));
    };
    return (
        <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between h-16 px-5 bg-white">
            <span className="text-2xl font-semibold text-gray-400">
                <Link href="/" legacyBehavior>
                    <a>
                        <Image
                            src={"/Reddit-Logo.wine.png"}
                            alt="logo"
                            width={100}
                            height={45}
                        />
                    </a>
                </Link>
            </span>

            <div className="max-w-full px-4">
                <div className="relative flex items-center bg-gray-100 border rounded hover:border-gray-700 hover:bg-white">
                    <FaSearch className="ml-2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Reddit"
                        className="px-3 py-1 bg-transparent h-7 rounded focus:outline-none"
                    />
                </div>
            </div>

            <div className="flex">
                {!loading && authenticated ? (
                    <button
                        onClick={handleLogout}
                        className="w-20 px-2 mr-2 text-center text-white bg-gray-400 rounded text-sm h-7"
                    >
                        로그아웃
                    </button>
                ) : (
                    <>
                        <Link legacyBehavior href="/login">
                            <a className="w-20 px-2 pt-1 text-sm mr-2 text-center text-blue-500 border border-blue-500 rounded">
                                로그인
                            </a>
                        </Link>
                        <Link legacyBehavior href="/register">
                            <a className="w-20 px-2 pt-1 text-sm text-center text-white bg-gray-400 rounded">
                                회원가입
                            </a>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default NavBar;
