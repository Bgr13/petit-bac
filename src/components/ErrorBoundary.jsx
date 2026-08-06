import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error("[ErrorBoundary]", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          minHeight:"100dvh", background:"#F8FAFF", padding:"32px 20px", fontFamily:"Nunito,sans-serif", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>😵</div>
          <div style={{ fontSize:20, fontWeight:800, color:"#2D3436", marginBottom:8 }}>Oups, quelque chose a planté</div>
          <div style={{ fontSize:14, color:"#636E72", marginBottom:24, maxWidth:300 }}>
            Une erreur inattendue s'est produite. Vos données locales sont intactes.
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{ background:"#6C5CE7", color:"#fff", border:"none", borderRadius:16, padding:"14px 28px",
              fontSize:15, fontWeight:800, cursor:"pointer" }}>
            Relancer l'app
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{ marginTop:24, fontSize:11, color:"#d63031", textAlign:"left",
              background:"#fff", padding:12, borderRadius:8, maxWidth:"100%", overflow:"auto" }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}


export { ErrorBoundary };
