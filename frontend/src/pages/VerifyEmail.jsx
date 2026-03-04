import paths from "@/configs/path";
import httpRequest from "@/utils/httpRequest";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

function VerifyEmail() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    /* Lấy danh sách task khi load trang */
    const verifyEmail = async () => {
        try {
            await httpRequest.post("/auth/verify-email", { token });
            navigate(paths.login, {
                // Truyền dữ liệu đi
                state: {
                    fromVerified: true,
                },
            });
        } catch (err) {
            setError("Liên kết xác thực đã hết hạn hoặc không hợp lệ: ", err);
        }
    };

    useEffect(() => {
        verifyEmail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <h1>Verify Email!</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </>
    );
}

export default VerifyEmail;
