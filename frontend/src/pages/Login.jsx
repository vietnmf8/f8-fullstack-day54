import React from "react";
import { useLocation } from "react-router";

function Login() {
    const { state } = useLocation();
    // State xuất hiện khi được truyền dữ liệu từ một page khác
    // --> Khi F5 trang, thì nó vẫn giữ được state vì nó vẫn biết page này thật sự được chuyển hướng từ trang verify

    // Còn khi copy paste http://localhost:5173/login vào một tab mới, hoặc truy cập thẳng vào nó,  thì sẽ không có state (vì nó là page mới, không được lưu vào lịch sử history)

    // Tóm lại: Một cái link muốn hiển thị message một lần duy nhất khi được chuyển hướng từ link khác ==> dùng state của navigate

    return (
        <>
            <h1>Đăng nhập</h1>
            {state?.fromVerified && (
                <p>Xác thực tài khoản thành công. Vui lòng đăng nhập</p>
            )}
        </>
    );
}

export default Login;
