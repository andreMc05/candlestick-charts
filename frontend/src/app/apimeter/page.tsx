"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Activity,
    AlertTriangle,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Clock,
    BarChart2
} from 'lucide-react';

// Add this interface before the component
interface UsageData {
  minute_usage: {
    current: number;
    limit: number;
    remaining: number;
  };
  daily_usage: {
    current: number;
    limit: number;
    remaining: number;
  };
}

interface RateLimitIndicatorProps {
  apiName: string;
  usageData: UsageData;
  className?: string;
}

type StatusType = 'normal' | 'warning' | 'critical';

// Update the component definition
const RateLimitIndicator = ({ apiName, usageData, className = "" }: RateLimitIndicatorProps) => {
    const [status, setStatus] = useState<StatusType>('normal');
    const [timeToReset, setTimeToReset] = useState<number | null>(null);

    useEffect(() => {
        if (!usageData) return;

        const minuteUsagePercent = (usageData.minute_usage.current / usageData.minute_usage.limit) * 100;
        const dailyUsagePercent = (usageData.daily_usage.current / usageData.daily_usage.limit) * 100;

        // Calculate status based on usage percentages
        if (minuteUsagePercent >= 90 || dailyUsagePercent >= 90) {
            setStatus('critical');
        } else if (minuteUsagePercent >= 75 || dailyUsagePercent >= 75) {
            setStatus('warning');
        } else {
            setStatus('normal');
        }

        // Calculate time to reset for minute-based limit
        const now = new Date();
        const secondsToNextMinute = 60 - now.getSeconds();
        setTimeToReset(secondsToNextMinute);
    }, [usageData]);

    const getStatusColor = (status: StatusType) => {
        switch (status) {
            case 'critical':
                return 'text-red-500 bg-red-50';
            case 'warning':
                return 'text-yellow-500 bg-yellow-50';
            default:
                return 'text-green-500 bg-green-50';
        }
    };

    const getStatusIcon = (status: StatusType) => {
        switch (status) {
            case 'critical':
                return <ShieldAlert className="w-5 h-5" />;
            case 'warning':
                return <Shield className="w-5 h-5" />;
            default:
                return <ShieldCheck className="w-5 h-5" />;
        }
    };

    if (!usageData) return null;

    const { minute_usage, daily_usage } = usageData;
    const minutePercent = (minute_usage.current / minute_usage.limit) * 100;
    const dailyPercent = (daily_usage.current / daily_usage.limit) * 100;

    return (
        <Card className={`${className} overflow-hidden`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        {apiName.replace('_', ' ')}
                    </div>
                    <div className={`px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="text-xs font-bold capitalize">{status}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Minute Usage */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>Per Minute</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    {minute_usage.current}/{minute_usage.limit}
                                </span>
                                {timeToReset && (
                                    <span className="text-xs text-gray-500">
                                        (Resets in {timeToReset}s)
                                    </span>
                                )}
                            </div>
                        </div>
                        <Progress
                            value={minutePercent}
                            className="h-2"
                            // indicatorClassName={
                            //     minutePercent >= 90 ? 'bg-red-500' :
                            //         minutePercent >= 75 ? 'bg-yellow-500' :
                            //             'bg-green-500'
                            // }
                        />
                    </div>

                    {/* Daily Usage */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <BarChart2 className="w-4 h-4" />
                                <span>Daily Limit</span>
                            </div>
                            <span className="text-sm font-medium">
                                {daily_usage.current}/{daily_usage.limit}
                            </span>
                        </div>
                        <Progress
                            value={dailyPercent}
                            className="h-2"
                            // indicatorClassName={
                            //     dailyPercent >= 90 ? 'bg-red-500' :
                            //         dailyPercent >= 75 ? 'bg-yellow-500' :
                            //             'bg-green-500'
                            // }
                        />
                    </div>

                    {/* Status Messages */}
                    {status === 'critical' && (
                        <Alert variant="destructive" className="mt-2">
                            <AlertTriangle className="w-4 h-4" />
                            <AlertDescription>
                                Critical rate limit threshold reached. Requests may be rejected.
                            </AlertDescription>
                        </Alert>
                    )}

                    {status === 'warning' && (
                        <Alert variant="default" className="mt-2">
                            <AlertTriangle className="w-4 h-4" />
                            <AlertDescription>
                                Approaching rate limit threshold. Consider reducing request frequency.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Remaining Calls */}
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500">Minute Remaining</div>
                            <div className="text-lg font-bold">{minute_usage.remaining}</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500">Daily Remaining</div>
                            <div className="text-lg font-bold">{daily_usage.remaining}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Usage example in a dashboard layout
const APIMetricsDashboard = () => {
    const [metricsData, setMetricsData] = useState({
        ALPHA_VANTAGE: {
            minute_usage: { current: 3, limit: 5, remaining: 2 },
            daily_usage: { current: 250, limit: 500, remaining: 250 }
        },
        FINNHUB: {
            minute_usage: { current: 45, limit: 60, remaining: 15 },
            daily_usage: { current: 1000, limit: 1500, remaining: 500 }
        },
        YAHOO_FINANCE: {
            minute_usage: { current: 80, limit: 100, remaining: 20 },
            daily_usage: { current: 1500, limit: 2000, remaining: 500 }
        }
    });

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">API Rate Limits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(metricsData).map(([apiName, data]) => (
                    <RateLimitIndicator
                        key={apiName}
                        apiName={apiName}
                        usageData={data}
                    />
                ))}
            </div>
        </div>
    );
};

export default APIMetricsDashboard;