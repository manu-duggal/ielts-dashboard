import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { supabase } from "./services/supabaseClient";

function App() {
  const [user, setUser] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔥 Check existing session on load
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setUser(data.session.user);
      }

      setLoading(false);
    };

    getSession();

    // 🔥 Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchClient = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("client_id")
        .eq("email", user.email)
        .single();

      if (!error) {
        setClientId(data.client_id);
      }
    };

    fetchClient();
  }, [user]);

  if (loading) return <h2>Loading...</h2>;
  if (!user) return <Login setUser={setUser} />;
  if (!clientId) return <h2>Loading dashboard...</h2>;

  return <Dashboard clientId={clientId} />;
}

export default App;