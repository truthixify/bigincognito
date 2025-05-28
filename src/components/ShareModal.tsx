/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useAppKitAccount } from '@reown/appkit/react';
import { useToast } from '@/components/ui/use-toast'
import { contractAddress } from '@lib/wallet/config'
import { abi } from '../abi/BigIncGenesis.json';
import { useReadContracts } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { erc20Abi } from 'viem'
import { useWriteContract } from 'wagmi'
import { useDisconnect } from '@reown/appkit/react'

interface ShareModalProps {
    totalShare: number
    yourShare?: number
    crypto: string
    onCryptoChange?: (crypto: string) => void
}


export function ShareModal({ totalShare, yourShare, crypto, onCryptoChange }: ShareModalProps) {
    const { disconnect } = useDisconnect()
    const { writeContractAsync } = useWriteContract()
    const [openModal, setOpenModal] = useState(false)
    const { toast } = useToast()
    const [maxShare, setMaxShare] = useState(0)
    const [shareValue, setShareValue] = useState(0)
    const [balance, setBalance] = useState(0)
    const [presaleActive, setPresaleActive] = useState(false)
    const { isConnected, address } = useAppKitAccount();

    let tokenAddress: `0x${string}` = crypto === "usdt" ? "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" : "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

    const availableShares = {
        abi,
        address: contractAddress as `0x${string}`,
        functionName: 'availableShares',
        args: [],
    }

    const getBalance = {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
    };

    const isPresaleActive = {
        abi,
        address: contractAddress as `0x${string}`,
        functionName: 'isPresaleActive',
        args: [],
    };


    const { data, isSuccess } = useReadContracts<any>({
        contracts: [availableShares, isPresaleActive, getBalance],
    });

    useEffect(() => {
        try {
            if (isConnected) {
                setMaxShare(Number(formatUnits(data?.[0]?.result as bigint, 6)));
                setPresaleActive(data?.[1]?.result as boolean);
                setBalance(Number(formatUnits(data?.[2]?.result as bigint, 6)));
            } else {
                setMaxShare(0);
            }
        } catch (error) {
            console.log(error)
        }
    }, [isSuccess, data]);

    const handleCryptoChange = (crypto: string) => {
        onCryptoChange && onCryptoChange(crypto);
    }

    const handleBuyShare = async (tokenAddress: `0x${string}`) => {
        let shareInFiat = (shareValue * (presaleActive ? 457143 : 680000) / 100);
        if (shareInFiat > balance) {
            toast({
                title: "Insufficient balance!",
                description: "Ensure you have enough balance to buy shares",
            });
        } else {
            try {
                let tokenAddress: `0x${string}` = crypto === "usdt" ? "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" : "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
                await writeContractAsync({
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: 'approve',
                    args: [
                        contractAddress as `0x${string}`,
                        parseUnits(shareInFiat.toString(), 6),
                    ],
                });
                toast({
                    title: "⏳ Contract Initiating...",
                    description: "Wait a bit ser",
                });
                setTimeout(async () => {
                    await writeContractAsync({
                        abi,
                        address: contractAddress as `0x${string}`,
                        functionName: 'mintShare',
                        args: [tokenAddress as `0x${string}`],
                    }).then(() => {
                        toast({
                            title: "✅ Shares bought successfully!",
                            description: "Reconnect your wallet to see your shares",
                        });
                        disconnect();
                        setOpenModal(false);
                    });
                }, 8000);
            } catch (error) {
                console.log(error, "Error from chain");
                if (String(error).includes("User denied transaction signature.")) {
                    toast({
                        variant: "destructive",
                        title: "❎ User rejected the request!",
                        description: "Ensure you have approved the token transfer",
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "❎ Error from chain!",
                        description: "Please try again",
                    });
                }
            }
        }
    }

    const handleSliderChange = (value: number[]) => {
        setShareValue(value[0])
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value)
        if (value >= 0 && value <= totalShare) {
            setShareValue(value)
        }
    }

    return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
            {isConnected ? <DialogTrigger asChild={isConnected}>
                <Button className='poppins-regular border-white border-solid border'>Own A Share</Button>
            </DialogTrigger> : <Button onClick={() => {
                if (!isConnected) {
                    toast({
                        title: "Wallet connect error!",
                        description: "Ensure your wallet is connected",
                    })
                }
            }} className='poppins-regular border-white border-solid border'>Own A Share</Button>}
            <div className='w-full text-sm text-center poppins-regular text-gray-400'>(connect to see your shares)</div>
            <w3m-button />
            <DialogContent className="sm:max-w-[425px] custom-scrollbar overflow-y-auto h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Buy Your Share</DialogTitle>
                    <DialogDescription className='poppins-regular'>
                        Move the slider or enter a value to adjust the amount of share you want to buy. You could also buy fractions of a share. Like 0.01, 0.001, etc.
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full">
                    <DialogTitle className='mb-2'>Share Value (%)</DialogTitle>
                    <div>
                        <Input
                            id="share"
                            type="number"
                            value={shareValue}
                            max={maxShare}
                            onChange={handleInputChange}
                            className="col-span-3 mb-5"
                        />
                    </div>
                    <p className='text-center text-gray-400 w-full'>{(shareValue * (presaleActive ? 457143 : 680000) / 100)} {crypto.toUpperCase()}</p>
                    <br />
                    <Slider
                        max={maxShare}
                        step={1}
                        value={[shareValue]}
                        onValueChange={handleSliderChange}
                        className="col-span-3"
                    />
                </div>
                <div className="w-full mx-auto max-w-md">
                    <Label htmlFor="crypto-holdings" className="text-base poppins-regular text-center font-medium mb-2 block">
                        Choose your holdings
                    </Label>
                    <RadioGroup id="crypto-holdings" defaultValue="usdt" className="flex mx-auto justify-center flex-row space-x-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem onClick={() => handleCryptoChange("usdt")} checked={crypto === "usdt"} value="usdt" id="usdt" />
                            <Label htmlFor="usdt">USDT</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem onClick={() => handleCryptoChange("usdc")} checked={crypto === "usdc"} value="usdc" id="usdc" />
                            <Label className='poppins-regular' htmlFor="usdc">USDC</Label>
                        </div>
                    </RadioGroup>
                    <div className='w-full mt-5 flex justify-center'>
                        <Button onClick={() => { handleBuyShare(tokenAddress) }} className='poppins-regular'>Buy Shares</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
