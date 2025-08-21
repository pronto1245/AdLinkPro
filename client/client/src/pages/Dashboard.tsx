import React, { useEffect, useState } from "react";
import { fetchMe } from "@/services/api";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then((res) => setUser(res))
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Загрузка...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Добро пожаловать, {user.username}</h1>
      <p>Роль: {user.role}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}
