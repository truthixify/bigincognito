"use client";
import React from "react";
import { Button } from "@components/ui/button";
import Image from "next/image";
import ScrollDown from "./icons/ScrollDown";

const Hero: React.FC = () => {
  return (
    <div className="flex w-full border-t border-gray-600 h-full relative">
      <div className="tab:w-6/12 base:max-sm:w-full border-r relative border-b border-solid border-gray-500 w-8/12 h-full base:max-md:pl-3 pl-10 pr-3 py-3">
        <div className="flex base:max-sm:text-[16px] justify-between base:max-md:text-lg text-gray-400">
          <p>RELEASED ON APRIL 26</p>
          <p>2024</p>
        </div>
        <div className="pt-[15vh] text-ourWhite">
          <div className="mb-5">
            <p className="text-2xl base:max-md:text-xl tracking-wide font-lighten font-bold">
              MIXTAPE<span className="relative -top-[2px]">:</span>
            </p>
            <p className="font-bolden base:max-md:text-6xl text-8xl base:max-md:tracking-[-.05em] tracking-tightest base:max-md:[word-spacing:-7px]">
              Let The
              <br />
              <span className="text-sun font-bolden">Sun</span> Talk
            </p>
          </div>
          <a
            href="https://audiomack.com/big-incognito/album/let-the-sun-talk"
            target="_blank"
          >
            <Button
              className="text-ourWhite px-10 rounded-none bg-[transparent] border font-extralight font-lighten tracking-widest"
              variant={"outline"}
            >
              LISTEN
            </Button>
          </a>
          <div className="absolute w-full base:max-md:pr-3 pr-10 base:max-md:text-lg bottom-3 flex base:max-md:left-3 left-10 items-end justify-between">
            <p className="text-gray-400 base:max-sm:text-[16px] text-justify flex">
              GOD MAN MACHINE PRESENTS
            </p>
            <div className="w-7 md:w-20">
              <ScrollDown />
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-4/12 base:max-sm:hidden tab:w-6/12 h-full border-solid border-b-0 border-gray-600 border-l-0 border-t-0">
        <div className="p-3 grow md:grow md:block">
          <div className="relative w-full h-full bg-gray-200">
            <Image
              src="/assets/img/big_inc_alt.jpg"
              alt="Big Inc Himself"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
        <div className="p-3 grow-0 hidden lg:block lg:grow-[0.6] border-l border-solid border-t-0 border-b-0 border-gray-600">
          <div className="relative w-full h-full bg-gray-200">
            <Image
              src="/assets/img/big_inc_mic.jpg"
              alt="Big Inc And A Mic"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
