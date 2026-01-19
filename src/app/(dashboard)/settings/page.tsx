"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Bell, Shield, Loader2, Check } from "lucide-react";
import { ChangePasswordModal } from "@/components/settings/change-password-modal";

export default function SettingsPage() {
  const { userInfo, signOut, user } = useUser();
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (userInfo?.fullName) {
      setFullName(userInfo.fullName);
    }
  }, [userInfo?.fullName]);

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
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const supabase = createClient();
      const updateData = {
        full_name: fullName,
        updated_at: new Date().toISOString(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (!error) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 md:space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-cyan" />
            <CardTitle className="text-lg md:text-xl">Thông tin cá nhân</CardTitle>
          </div>
          <CardDescription>
            Cập nhật thông tin hồ sơ của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 space-y-4 md:space-y-6">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-16 w-16 md:h-20 md:w-20">
              <AvatarImage src={userInfo?.avatarUrl || ""} />
              <AvatarFallback className="text-lg md:text-xl">
                {getInitials(userInfo?.fullName || userInfo?.email || null)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <p className="font-medium text-text-primary">
                {userInfo?.fullName || "Chưa cập nhật tên"}
              </p>
              <p className="text-sm text-text-muted">
                {userInfo?.email}
              </p>
              {userInfo?.avatarUrl && (
                <p className="text-xs text-success mt-1">
                  Ảnh từ Google
                </p>
              )}
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
                value={userInfo?.email || ""}
                disabled
                className="pl-10 bg-background-tertiary"
              />
            </div>
            <p className="text-xs text-text-muted">
              Email không thể thay đổi
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saveSuccess && <Check className="mr-2 h-4 w-4" />}
              {saveSuccess ? "Đã lưu" : "Lưu thay đổi"}
            </Button>
            {saveSuccess && (
              <span className="text-sm text-success">
                Cập nhật thành công!
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan" />
            <CardTitle className="text-lg md:text-xl">Thông báo</CardTitle>
          </div>
          <CardDescription>
            Quản lý cài đặt thông báo
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <p className="text-text-secondary text-sm">
            Tính năng đang được phát triển...
          </p>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan" />
            <CardTitle className="text-lg md:text-xl">Bảo mật</CardTitle>
          </div>
          <CardDescription>
            Quản lý bảo mật tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 space-y-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            Đổi mật khẩu
          </Button>
          <div className="pt-4 border-t border-border">
            <Button variant="danger" onClick={signOut} className="w-full sm:w-auto">
              Đăng xuất
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
