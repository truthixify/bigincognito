"use client"
import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent} from "@/components/ui/card"

interface ShareChartProps {
    availableShare?: number
    yourShare?: number
    soldShare?: number
}

export function ShareChart({ availableShare = 100, yourShare = 0, soldShare = 0 }: ShareChartProps) {
    const data = [
        { name: 'Your Shares', value: yourShare },
        { name: 'Available Shares', value: availableShare},
        { name: 'Sold Shares', value: soldShare},
    ]

    const COLORS = ['#506AE9', '#9FA4AE', '#7BB274']

    return (
        <Card className="w-full poppins-regular max-w-md border-none bg-transparent">
            <CardContent>
                <ResponsiveContainer className="poppins-regular" width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#C0C5CC"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell className='poppins-regular' key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend className='poppins-regular' />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}