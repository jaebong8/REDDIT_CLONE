import axios from "axios";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { useAuthState } from "../context/auth";
import { Post } from "../types";

interface PostCardProps {
    post: Post;
    subMutate: () => void;
}
const PostCard = ({
    post: {
        identifier,
        slug,
        title,
        body,
        subName,
        createdAt,
        voteScore,
        userVote,
        commentCount,
        url,
        username,
        sub,
    },
    subMutate,
}: PostCardProps) => {
    const router = useRouter();
    const { authenticated } = useAuthState();
    const isInSubPage = router.pathname === "/r/[sub]";
    const vote = async (value: number) => {
        if (!authenticated) router.push("/login");

        if (value === userVote) value = 0;

        try {
            await axios.post("/votes", { identifier, slug, value });
            subMutate();
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div className="flex mb-4 bg-white rounded" id={identifier}>
            <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
                {/* 좋아요 부분 */}
                <div
                    className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                    onClick={() => vote(1)}
                >
                    {userVote === 1 ? (
                        <FaArrowUp className="text-red-500" />
                    ) : (
                        <FaArrowUp />
                    )}
                </div>
                <p className="text-xs font-bold">{voteScore}</p>
                {/* 싫어요 부분 */}
                <div
                    className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-500"
                    onClick={() => vote(-1)}
                >
                    {userVote === -1 ? (
                        <FaArrowDown className="text-blue-500" />
                    ) : (
                        <FaArrowDown />
                    )}
                </div>
            </div>
            <div className="w-full p-2">
                {!isInSubPage && (
                    <div className="flex items-center">
                        <Link href={`/r/${subName}`}>
                            <a>
                                <Image
                                    src={sub!.imgUrl}
                                    alt="sub"
                                    className="rounded-full cursor-pointer "
                                    width={12}
                                    height={12}
                                />
                            </a>
                        </Link>
                        <Link href={`/r/${subName}`}>
                            <a className="ml-2 text-xs font-bold cursor-pointer hover:underline">
                                /r/{subName}
                            </a>
                        </Link>
                        <span className="mx-1 text-xs text-gray-400">•</span>
                    </div>
                )}

                <p className="text-xs text-gray-400">
                    Posted by{" "}
                    <Link href={`/r/${username}`} legacyBehavior>
                        <a className="mx-1 hover:underline">/u/{username}</a>
                    </Link>
                    <Link href={url} legacyBehavior>
                        <a className="mx-1 hover:undeline">
                            {dayjs(createdAt).format("YYYY-MM-DD HH:mm")}
                        </a>
                    </Link>
                </p>

                <Link href={url} legacyBehavior>
                    <a className="my-1 text-lg font-medium ">{title}</a>
                </Link>
                {body && <p className="my-1 text-sm ">{body}</p>}
                <div className="flex">
                    <Link href={url} legacyBehavior>
                        <a>
                            <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                            <span>{commentCount}</span>
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PostCard;