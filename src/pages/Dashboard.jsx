import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function Dashboard({ clientId }) {
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [weeklyLeads, setWeeklyLeads] = useState(0);

  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 🔹 Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 Fetch Leads
  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) return;

      setLeads(data);
      setTotalLeads(data.length);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weekly = data.filter(
        (lead) => new Date(lead.created_at) >= oneWeekAgo
      );

      setWeeklyLeads(weekly.length);
    };

    fetchLeads();
  }, [clientId]);

  const getPriority = (score) => {
    if (score >= 3) return "HOT";
    if (score === 2) return "WARM";
    return "COLD";
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    let valA;
    let valB;

    if (sortField === "priority") {
      const order = { HOT: 3, WARM: 2, COLD: 1 };
      valA = order[getPriority(a.score)];
      valB = order[getPriority(b.score)];
    } else {
      valA = a[sortField];
      valB = b[sortField];
    }

    if (sortField === "created_at") {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (!valA) return 1;
    if (!valB) return -1;

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;

    return 0;
  });

  const markContacted = async (leadId) => {
    const { error } = await supabase
      .from("leads")
      .update({ status: "CONTACTED" })
      .eq("id", leadId);

    if (!error) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, status: "CONTACTED" } : l
        )
      );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div style={{ padding: 20, background: "#f5f6fa", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 20
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Leads Dashboard</h1>
          <p style={{ margin: 0, fontSize: 12, color: "#777" }}>
            Manage your leads
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            background: "#e0e0e0",
            borderRadius: 8,
            border: "none",
            cursor: "pointer"
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#555";
            e.target.style.color = "#fff";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#e0e0e0";
            e.target.style.color = "#000";
          }}
        >
          Logout
        </button>
      </div>

      {/* METRICS */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <div style={cardStyle}>
          <h4>Total Leads</h4>
          <h2>{totalLeads}</h2>
        </div>

        <div style={cardStyle}>
          <h4>Last 7 Days</h4>
          <h2>{weeklyLeads}</h2>
        </div>
      </div>

      {/* CONTENT */}
      {isMobile ? (

        // 📱 MOBILE CARDS
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sortedLeads.map((lead) => {
            const priority = getPriority(lead.score);

            return (
              <div key={lead.id} style={cardMobile}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{lead.name || "—"}</strong>
                  <span style={priorityStyle(priority)}>{priority}</span>
                </div>

                <div>📞 {lead.phone}</div>
                <div><span style={bandStyle}>{lead.estimated_band || "N/A"}</span></div>
                <div><span style={statusStyle(lead.status)}>{lead.status}</span></div>

                <div style={{ fontSize: 12, color: "#666" }}>
                  {new Date(lead.created_at).toLocaleString()}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <a href={`tel:${lead.phone}`}><button style={actionBtn}>📞</button></a>
                  <a href={`https://wa.me/91${lead.phone}`} target="_blank"><button style={actionBtn}>💬</button></a>
                  <button onClick={() => markContacted(lead.id)} style={actionBtn}>✓</button>
                </div>
              </div>
            );
          })}
        </div>

      ) : (

        // 💻 DESKTOP TABLE (UNCHANGED)
        <div style={{ ...tableCardStyle, overflowX: "auto" }}>
          <table style={{ minWidth: "700px", borderCollapse: "collapse" }}>

            <thead>
              <tr style={headerRowStyle}>
                <th style={clickable} onClick={() => handleSort("name")}>Name</th>
                <th>Phone</th>
                <th style={clickable} onClick={() => handleSort("estimated_band")}>Band</th>
                <th style={clickable} onClick={() => handleSort("priority")}>Priority</th>
                <th>Status</th>
                <th style={clickable} onClick={() => handleSort("created_at")}>Time</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedLeads.map((lead) => {
                const priority = getPriority(lead.score);

                return (
                  <tr key={lead.id} style={rowStyle}>
                    <td style={cell}>{lead.name}</td>
                    <td style={cell}>{lead.phone}</td>
                    <td style={cell}><span style={bandStyle}>{lead.estimated_band}</span></td>
                    <td style={cell}><span style={priorityStyle(priority)}>{priority}</span></td>
                    <td style={cell}><span style={statusStyle(lead.status)}>{lead.status}</span></td>
                    <td style={cell}>{new Date(lead.created_at).toLocaleString()}</td>
                    <td style={cell}>
                      <a href={`tel:${lead.phone}`}><button style={actionBtn}>📞</button></a>
                      <a href={`https://wa.me/91${lead.phone}`} target="_blank"><button style={actionBtn}>💬</button></a>
                      <button onClick={() => markContacted(lead.id)} style={actionBtn}>✓</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

      )}
    </div>
  );
}

// 🎨 Styles
const cardStyle = {
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  flex: "1 1 150px",
};

const tableCardStyle = {
  background: "#fff",
  borderRadius: 10,
  padding: 15,
};

const cardMobile = {
  background: "#fff",
  padding: 15,
  borderRadius: 10,
};

const headerRowStyle = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const rowStyle = {
  borderBottom: "1px solid #eee",
};

const clickable = { cursor: "pointer" };

const cell = { padding: "10px" };

const bandStyle = {
  background: "#e3f2fd",
  padding: "4px 6px",
  borderRadius: 6,
};

const statusStyle = (status) => ({
  padding: "4px 6px",
  borderRadius: 6,
  background: status === "CONTACTED" ? "#d4edda" : "#fff3cd",
});

const priorityStyle = (priority) => ({
  padding: "4px 6px",
  borderRadius: 6,
  background:
    priority === "HOT"
      ? "#f8d7da"
      : priority === "WARM"
      ? "#fff3cd"
      : "#e2e3e5",
});

const actionBtn = {
  border: "none",
  padding: "6px",
  borderRadius: 6,
  background: "#f1f3f5",
};