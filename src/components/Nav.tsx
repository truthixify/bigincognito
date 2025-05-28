"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const logoWidth = 371;
const logoHeight = 87;

const Nav: React.FC = () => {
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const { toast } = useToast();
  return (
    <nav className="w-full font-bolden sticky top-[0] z-50">
      <div className="mx-auto base:max-md:px-3 relative items-center flex py-5 px-10 w-full max-w-screen-2xl">
        <Image
          priority
          src="/assets/img/big_inc_logo.png"
          width={100}
          height={(100 / logoWidth) * logoHeight}
          alt="Big Inc Logo"
        />
        <svg
          onClick={() => setMenu(true)}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="block lg:hidden ml-auto cursor-pointer"
        >
          <rect y="4" width="24" height="2" fill="white" />
          <rect y="11" width="24" height="2" fill="white" />
          <rect y="18" width="24" height="2" fill="white" />
        </svg>
        <ul
          className={`ml-auto z-50 bg-gray-800 backdrop-filter backdrop-blur-[8px] lg:bg-transparent lg:backdrop-blur-none absolute lg:relative lg:flex-row flex-col text-ourWhite lg:p-0 base:max-md:px-3 px-10 py-20 flex gap-4 w-full lg:w-auto top-0 left-0 ${
            menu ? "flex" : "hidden"
          } lg:flex`}
        >
          <svg
            onClick={() => setMenu(false)}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="lg:hidden block absolute cursor-pointer top-5 right-10 base:max-md:right-3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <li className="cursor-pointer">
            <Link
              onClick={()=> setMenu(false)}
              className={`${pathname == "/" ? "underline" : ""}`}
              href={"/"}
            >
              HOME
            </Link>
          </li>
          <li
            className="cursor-pointer"
            onClick={() => {
              toast({
                title: "This Page Is Coming Soon",
                description:
                  "We are BUIDLING",
              });
            }}
          >
            {/* <Link
              className={`${pathname == "/music" ? "underline" : ""}`}
              onClick={() => {
                toast({
                  title: "This Page Is Coming Soon",
                  description:
                    "We are BUIDLing on this page",
                });
              }}
              href={""}
            > */}
            MUSIC
            {/* </Link> */}
          </li>
          <li
            className="cursor-pointer"
            onClick={() => {
              toast({
                title: "This Page Is Coming Soon",
                description:
                  "We are BUIDLING",
              });
            }}
          >
            {/* <Link
              className={`${pathname == "/tour" ? "underline" : ""}`}
              onClick={() => {
                toast({
                  title: "This Page Is Coming Soon",
                  description:
                    "We are BUIDLING",
                });
              }}
              href={""}
            > */}
            TOUR
            {/* </Link> */}
          </li>
          <li
            className="cursor-pointer"
            onClick={() => {
              toast({
                title: "This Page Is Coming Soon",
                description:
                  "We are BUIDLING",
              });
            }}
          >
            {/* <Link
              className={`${pathname == "/shop" ? "underline" : ""}`}
              onClick={() => {
                toast({
                  title: "This Page Is Coming Soon",
                  description:
                    "We are BUIDLING",
                });
              }}
              href={""}
            > */}
            SHOP
            {/* </Link> */}
          </li>
          <li className="cursor-pointer">
            <Link
              onClick={()=> setMenu(false)}
              className={`${pathname == "/dewhitepaper" ? "underline" : ""}`}
              href={"/dewhitepaper"}
            >
              deWHITEPAPER
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Nav;
