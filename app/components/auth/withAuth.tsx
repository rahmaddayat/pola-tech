"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AlertModal from "@/app/components/ui/alertModal";

export default function withAuth(Component: any) {
  return function ProtectedRoute(props: any) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
      const session = localStorage.getItem("user_session");
      if (!session) {
        setShowAlert(true);
      } else {
        setIsLoggedIn(true);
      }
    }, []);

    const handleCloseAlert = () => {
      setShowAlert(false);
      router.push("/"); // Lempar balik ke Home jika tidak login
    };

    if (showAlert) {
      return (
        <AlertModal
          isOpen={showAlert}
          onClose={handleCloseAlert}
          title="Akses Ditolak"
          message="Anda harus login terlebih dahulu untuk mengakses halaman ini."
          type="error"
        />
      );
    }

    // Jika belum dicek atau tidak login, jangan tampilkan apa-apa dulu
    if (!isLoggedIn) return null;

    return <Component {...props} />;
  };
}