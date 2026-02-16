export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Settings } from 'lucide-react';
import Link from 'next/link';

export default function MobileAdminSettings() {
  const settings = [
    {
      category: 'General',
      items: [
        { label: 'Maintenance Mode', enabled: false },
        { label: 'User Registration', enabled: true },
        { label: 'Email Verification Required', enabled: true },
      ],
    },
    {
      category: 'Security',
      items: [
        { label: '2FA Required for Admin', enabled: true },
        { label: 'IP Whitelisting', enabled: false },
        { label: 'Session Timeout (30 min)', enabled: true },
      ],
    },
    {
      category: 'Content',
      items: [
        { label: 'Auto-Moderate Content', enabled: true },
        { label: 'Require Review Before Publish', enabled: false },
        { label: 'Ban Explicit Content', enabled: true },
      ],
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10 flex items-center gap-3">
        <Link href="/m/admin/more">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-primary">Settings</h1>
          <p className="text-xs text-muted-foreground">System configuration</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {settings.map((section) => (
          <div key={section.category}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
              {section.category}
            </h2>
            <Card>
              <CardContent className="p-0">
                {section.items.map((item, idx) => (
                  <div
                    key={item.label}
                    className={`p-4 flex items-center justify-between ${
                      idx !== section.items.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    <label className="text-sm font-medium cursor-pointer flex-1">
                      {item.label}
                    </label>
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                      <input
                        type="checkbox"
                        defaultChecked={item.enabled}
                        className="sr-only"
                      />
                      <div
                        className={`inline-block h-4 w-4 transform rounded-full transition ${
                          item.enabled
                            ? 'translate-x-6 bg-primary'
                            : 'translate-x-1 bg-gray-400'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Save Button */}
        <Button className="w-full">Save Settings</Button>
      </div>
    </div>
  );
}
