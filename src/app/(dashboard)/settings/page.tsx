"use client";

import { useState } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-user";
import { User, Mail, Bell, Shield, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, profile, signOut } = useUser();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isSaving, setIsSaving] = useState(false);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Save profile logic here
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <>
      <Navbar title="Cài đặt" />
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-cyan" />
              <CardTitle>Thông tin cá nhân</CardTitle>
            </div>
            <CardDescription>
              Cập nhật thông tin hồ sơ của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="text-xl">
                  {getInitials(profile?.full_name || user?.email || null)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  Đổi ảnh đại diện
                </Button>
                <p className="text-xs text-text-muted mt-1">
                  JPG, PNG. Tối đa 1MB.
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
              />
            </div>

            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="pl-10 bg-background-tertiary"
                />
              </div>
              <p className="text-xs text-text-muted">
                Email không thể thay đổi
              </p>
            </div>

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-cyan" />
              <CardTitle>Thông báo</CardTitle>
            </div>
            <CardDescription>
              Quản lý cài đặt thông báo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary text-sm">
              Tính năng đang được phát triển...
            </p>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan" />
              <CardTitle>Bảo mật</CardTitle>
            </div>
            <CardDescription>
              Quản lý bảo mật tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">
              Đổi mật khẩu
            </Button>
            <div className="pt-4 border-t border-border">
              <Button variant="danger" onClick={signOut}>
                Đăng xuất
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
