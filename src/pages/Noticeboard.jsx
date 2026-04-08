import { useState, useEffect } from "react";
import Badge from "../components/ui/Badge";
import { PlusIcon, EditIcon, TrashIcon } from "../components/ui/Icons";
import { C, body, display } from "../theme";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const inputStyle = {
  width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`,
  borderRadius: 0, fontSize: 13, fontFamily: body, color: C.textDark,
  background: C.white, outline: "none", marginTop: 4,
};

export default function Noticeboard() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState({ title: "", body: "", pinned: false });
  const [saving, setSaving] = useState(false);

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("noticeboard_posts")
      .select("*, profiles(full_name)")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (!error) setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const openNew = () => {
    setEditingPost(null);
    setForm({ title: "", body: "", pinned: false });
    setShowForm(true);
  };

  const openEdit = (post) => {
    setEditingPost(post);
    setForm({ title: post.title, body: post.body, pinned: post.pinned });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editingPost) {
      await supabase.from("noticeboard_posts").update({
        title: form.title, body: form.body, pinned: form.pinned, updated_at: new Date().toISOString(),
      }).eq("id", editingPost.id);
    } else {
      await supabase.from("noticeboard_posts").insert({
        title: form.title, body: form.body, pinned: form.pinned,
        author_id: profile.id, author_name: profile.full_name,
      });
    }
    setSaving(false);
    setShowForm(false);
    fetchPosts();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this notice?")) return;
    await supabase.from("noticeboard_posts").delete().eq("id", id);
    fetchPosts();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textDark, margin: "0 0 4px", fontFamily: display, letterSpacing: 1 }}>Community Notice Board</h2>
          <p style={{ fontSize: 13, color: C.textLight, margin: 0, fontFamily: body }}>Announcements from the committee</p>
        </div>
        {isAdmin && (
          <button
            onClick={openNew}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
              background: C.maroon, color: C.white, border: "none", borderRadius: 0,
              fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: body,
            }}
          >
            <PlusIcon/> New Notice
          </button>
        )}
      </div>

      {/* Post form */}
      {showForm && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textDark, margin: "0 0 16px", fontFamily: display, letterSpacing: 1 }}>
            {editingPost ? "Edit Notice" : "New Notice"}
          </h3>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>Title</label>
              <input type="text" required style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Notice title"/>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>Content</label>
              <textarea required style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Notice content…"/>
            </div>
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="pinned" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} style={{ accentColor: C.maroon }}/>
              <label htmlFor="pinned" style={{ fontSize: 13, color: C.textMid, fontFamily: body, cursor: "pointer" }}>Pin this notice to the top</label>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={saving} style={{ padding: "10px 22px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: body, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "Save Notice"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 22px", background: "transparent", color: C.textMid, border: `1px solid ${C.border}`, borderRadius: 0, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: body }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <p style={{ color: C.textLight, fontFamily: body }}>Loading notices…</p>
      ) : posts.length === 0 ? (
        <p style={{ color: C.textLight, fontFamily: body }}>No notices yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {posts.map((post) => (
            <div key={post.id} style={{
              padding: "22px 24px", background: C.white, borderRadius: 0,
              border: `1px solid ${C.border}`,
              borderLeft: post.pinned ? `3px solid ${C.maroon}` : `1px solid ${C.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: C.textDark, fontFamily: body }}>{post.title}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, marginLeft: 12 }}>
                  {post.pinned && <Badge color="maroon">Pinned</Badge>}
                  <span style={{ fontSize: 12, color: C.textLight, fontFamily: body }}>
                    {new Date(post.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </span>
                  {isAdmin && (
                    <>
                      <button onClick={() => openEdit(post)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight, padding: 4 }}><EditIcon/></button>
                      <button onClick={() => handleDelete(post.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.red, padding: 4 }}><TrashIcon/></button>
                    </>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7, margin: "0 0 8px", fontFamily: body }}>{post.body}</p>
              <div style={{ fontSize: 12, color: C.textLight, fontFamily: body }}>
                Posted by {post.profiles?.full_name || post.author_name || "Committee"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
