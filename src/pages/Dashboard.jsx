import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function Dashboard({ clientId }) {
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [weeklyLeads, setWeeklyLeads] = useState(0);

  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  // 🔹 Fetch Leads
  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error);
        return;
      }

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

  // 🔹 Priority logic
  const getPriority = (score) => {
    if (score >= 3) return "HOT";
    if (score === 2) return "WARM";
    return "COLD";
  };

  // 🔹 Sorting
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

  // 🔹 Mark Contacted
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

  // 🔹 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div style={{ padding: 20, background: "#f5f6fa", minHeight: "100vh" }}>

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, color: "#222" }}>
            Leads Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#777" }}>
            Manage and track your leads efficiently
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            background: "#e0e0e0",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            color: "#333",
            transition: "0.2s",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#555";
            e.target.style.color = "#fff";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#e0e0e0";
            e.target.style.color = "#333";
          }}
        >
          Logout
        </button>
      </div>

      {/* METRICS */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div style={cardStyle}>
          <h4>Total Leads</h4>
          <h2>{totalLeads}</h2>
        </div>

        <div style={cardStyle}>
          <h4>Leads (Last 7 Days)</h4>
          <h2>{weeklyLeads}</h2>
        </div>
      </div>

      {/* TABLE */}
      <div style={tableCardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>

          <thead>
            <tr style={headerRowStyle}>
              <th style={clickable} onClick={() => handleSort("name")}>Name ⬍</th>
              <th style={{ padding: "12px 10px" }}>Phone</th>
              <th style={clickable} onClick={() => handleSort("estimated_band")}>Band ⬍</th>
              <th style={clickable} onClick={() => handleSort("priority")}>Priority ⬍</th>
              <th>Status</th>
              <th style={clickable} onClick={() => handleSort("created_at")}>Time ⬍</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedLeads.map((lead) => {
              const priority = getPriority(lead.score);

              return (
                <tr
                  key={lead.id}
                  style={rowStyle}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#f9fafb";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "#fff";
                  }}
                >
                  <td style={{ padding: "12px 10px" }}>{lead.name || "—"}</td>
                  <td style={{ padding: "12px 10px" }}>{lead.phone}</td>

                  <td style={{ padding: "12px 10px" }}>
                    <span style={bandStyle}>
                      {lead.estimated_band || "N/A"}
                    </span>
                  </td>

                  <td style={{ padding: "12px 10px" }}>
                    <span style={priorityStyle(priority)}>
                      {priority}
                    </span>
                  </td>

                  <td style={{ padding: "12px 10px" }}>
                    <span style={statusStyle(lead.status)}>
                      {lead.status}
                    </span>
                  </td>

                  <td style={{ padding: "12px 10px", fontSize: 12, color: "#666" }}>
                    {new Date(lead.created_at).toLocaleString()}
                  </td>

                  <td style={{ padding: "10px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a href={`tel:${lead.phone}`}>
                        <button style={actionBtn}>📞</button>
                      </a>

                      <a href={`https://wa.me/91${lead.phone}`} target="_blank">
                        <button style={actionBtn}>💬</button>
                      </a>

                      <button
                        onClick={() => markContacted(lead.id)}
                        style={actionBtn}
                      >
                        ✓
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
}

// 🎨 Styles
const cardStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  flex: 1,
};

const tableCardStyle = {
  background: "#fff",
  borderRadius: 10,
  padding: 20,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const headerRowStyle = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const rowStyle = {
  borderBottom: "1px solid #eee",
  transition: "0.2s",
};

const clickable = {
  cursor: "pointer",
};

const bandStyle = {
  background: "#e3f2fd",
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 12,
};

const statusStyle = (status) => ({
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 12,
  background: status === "CONTACTED" ? "#d4edda" : "#fff3cd",
});

const priorityStyle = (priority) => ({
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 12,
  background:
    priority === "HOT"
      ? "#f8d7da"
      : priority === "WARM"
      ? "#fff3cd"
      : "#e2e3e5",
});

const actionBtn = {
  border: "none",
  padding: "6px 8px",
  borderRadius: 6,
  cursor: "pointer",
  background: "#f1f3f5",
  fontSize: 12,
};