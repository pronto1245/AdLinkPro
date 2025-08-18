import React from "react";
import { Link } from "wouter";

function Tile(props: { href: string; title: string; descr?: string }) {
  return (
    <Link href={props.href}>
      <a
        style={{
          display: "block",
          padding: 16,
          borderRadius: 12,
          border: "1px solid #2a2f3a",
          background: "#0f172a",
          color: "#e5e7eb",
          textDecoration: "none",
          boxShadow: "0 6px 16px rgba(0,0,0,.25)",
          height: "100%",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
          {props.title}
        </div>
        {props.descr && (
          <div style={{ color: "#9ca3af", fontSize: 13 }}>{props.descr}</div>
        )}
      </a>
    </Link>
  );
}

export default function PartnerDashboard() {
  return (
    <div style={{ padding: 24, color: "#e5e7eb" }}>
      <h1 style={{ margin: "0 0 8px" }}>Панель партнёра</h1>
      <p style={{ margin: "0 0 20px", color: "#9ca3af" }}>
        Добро пожаловать в Affilix.Click — раздел партнёра.
      </p>

      {/* Быстрое меню разделов */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <Tile
          href="/dash/offers"
          title="Офферы"
          descr="Каталог офферов и заявок на доступ"
        />
        <Tile
          href="/dash/statistics"
          title="Статистика"
          descr="Клики, конверсии, CR, выплаты"
        />
        <Tile
          href="/dash/finances"
          title="Финансы"
          descr="Баланс, выплаты и история"
        />
        <Tile
          href="/dash/postbacks"
          title="Постбеки"
          descr="Настройка постбек-URL и тесты"
        />
        <Tile
          href="/dash/notifications"
          title="Уведомления"
          descr="Системные сообщения и события"
        />
        <Tile
          href="/dash/profile"
          title="Профиль"
          descr="Данные аккаунта и контакты"
        />
      </div>

      {/* Место под виджеты/metrix (заглушки) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 14,
        }}
      >
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid #2a2f3a",
            background: "#0b1220",
          }}
        >
          <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Сегодня
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>—</div>
          <div style={{ color: "#9ca3af", fontSize: 12 }}>Клики / Лиды</div>
        </div>
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid #2a2f3a",
            background: "#0b1220",
          }}
        >
          <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 6 }}>
            Баланс
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>—</div>
          <div style={{ color: "#9ca3af", fontSize: 12 }}>₽ / $</div>
        </div>
      </div>
    </div>
  );
}
