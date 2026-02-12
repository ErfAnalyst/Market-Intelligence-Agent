import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from brain import brain

# --- PAGE CONFIG ---
st.set_page_config(
    page_title="AD&I Market Intelligence",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- THEME & CSS (AI STUDIO AESTHETIC) ---
st.markdown("""
<style>
    /* Global Background & Font */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    
    html, body, [class*="css"]  {
        font-family: 'Inter', sans-serif;
        color: #0f172a;
    }

    /* Cards */
    .stMetric {
        background-color: #f8fafc !important; /* Slate 50 */
        border: 1px solid #cbd5e1 !important; /* Slate 300 */
        padding: 15px;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
    }
    
    .stMetric:hover {
        border-color: #3b82f6 !important;
        transform: translateY(-2px);
    }

    /* Metric Labels (Title) */
    [data-testid="stMetricLabel"] {
        color: #475569 !important; /* Slate 600 */
        font-size: 0.95rem !important;
        font-weight: 600 !important;
    }

    /* Metric Values */
    [data-testid="stMetricValue"] {
        color: #0f172a !important; /* Slate 900 - Almost Black */
        font-weight: 800 !important;
        font-size: 1.8rem !important;
    }

    /* Headers */
    .main-title {
        background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
        font-size: 2.2rem;
        margin-bottom: 0.5rem;
    }
    
    .section-header {
        color: #1e293b;
        font-weight: 600;
        font-size: 1.3rem;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        border-left: 4px solid #3b82f6;
        padding-left: 1rem;
    }
    
    /* Info Box */
    .info-box {
        background-color: #f0f9ff;
        border: 1px solid #bae6fd;
        padding: 1rem;
        border-radius: 8px;
        color: #0369a1;
        margin-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# --- SIDEBAR ---
with st.sidebar:
    st.title("🦷 AD&I Intelligence")
    st.caption("Market Strategist Agent 260206")
    st.divider()
    
    selected_page = st.radio(
        "Navigation", 
        ["Market Matrix", "Competitor Details", "Research Lab"]
    )
    
    st.divider()
    st.markdown("### 📍 Location Scope")
    
    dma_options = ["Dallas DFW DMA", "Houston", "Austin", "San Antonio", "Other..."]
    dma_selection = st.selectbox("Select Market", dma_options)
    
    selected_dma = None
    if dma_selection == "Other...":
        user_input = st.text_input("Enter Market Name", placeholder="e.g. Phoenix, AZ")
        if user_input:
            selected_dma = user_input
    else:
        selected_dma = dma_selection

    if selected_dma:
        st.success(f"Locked: {selected_dma}")

# --- PAGE 1: MARKET MATRIX ---
if selected_page == "Market Matrix":
    st.markdown(f'<div class="main-title">Competitive Market Matrix</div>', unsafe_allow_html=True)
    
    if not selected_dma:
        st.info("👈 Please select or enter a market in the sidebar to begin analysis.")
        st.stop()

    st.markdown(f"**Context:** Analyzing competitive density and pricing architecture for **{selected_dma}**")

    with st.spinner(f"Agent 260206 is building the matrix for {selected_dma}..."):
        data = brain.get_market_matrix(selected_dma)
    
    if data:
        df = pd.DataFrame(data)
        
        # Data Cleaning for Visuals (Global)
        chart_df_global = df.copy()
        cols_to_clean = ['priceDenture', 'priceTier1Low', 'priceTier1High']
        for col in cols_to_clean:
            chart_df_global[col] = pd.to_numeric(chart_df_global[col], errors='coerce').fillna(0)

        # 1. High-Level KPI Cards (Always shows total market)
        st.markdown('<div class="section-header">Market Vitals</div>', unsafe_allow_html=True)
        k1, k2, k3, k4 = st.columns(4)
        
        with k1:
            st.metric("Competitive Set", len(df))
        with k2:
            st.metric("Avg Clinics/DSO", round(df['clinicCount'].mean(), 1))
        with k3:
            total_surgeons = df['surgeonCount'].sum()
            st.metric("Implant Surgeons", total_surgeons)
        with k4:
            # Calc avg price ignoring 0s
            valid_prices = chart_df_global[chart_df_global['priceDenture'] > 0]['priceDenture']
            avg_price = valid_prices.mean() if not valid_prices.empty else 0
            st.metric("Avg Economy Denture", f"${avg_price:,.0f}")

        # 2. Main Data Table (With Search)
        st.markdown('<div class="section-header">Level 1: Competitive Scan</div>', unsafe_allow_html=True)
        
        # Search Filter
        search_col, _ = st.columns([1, 2])
        with search_col:
            search_query = st.text_input("Filter by Name", placeholder="🔍 Search DSO...", label_visibility="collapsed")
        
        # Apply Filter
        filtered_df = df.copy()
        if search_query:
            filtered_df = filtered_df[filtered_df['dsoName'].str.contains(search_query, case=False, na=False)]
        
        # Color highlighting for AD&I
        def highlight_adi(row):
            if "AD&I" in str(row['dsoName']) or "Affordable" in str(row['dsoName']):
                return ['background-color: #e0f2fe; color: #0c4a6e; font-weight: bold'] * len(row)
            return [''] * len(row)

        st.dataframe(
            filtered_df.style.apply(highlight_adi, axis=1),
            column_config={
                "dsoName": st.column_config.TextColumn("DSO / Practice", width="medium"),
                "geographicFocus": "Geo Focus",
                "clinicCount": st.column_config.NumberColumn("Clinics"),
                "dentistCount": st.column_config.NumberColumn("Dentists"),
                "dentistsPerClinic": st.column_config.NumberColumn("DDS/Clinic", format="%.2f"),
                "surgeonCount": st.column_config.NumberColumn("Surgeons"),
                "priceDenture": st.column_config.NumberColumn("Econ Denture", format="$%d"),
                "priceTier1Low": st.column_config.NumberColumn("Tier 1 (Low)", format="$%d"),
                "priceTier1High": st.column_config.NumberColumn("Tier 1 (High)", format="$%d"),
            },
            use_container_width=True,
            hide_index=True,
            height=500
        )

        # 3. Advanced Visualization (Uses filtered data)
        if not filtered_df.empty:
            st.markdown('<div class="section-header">Pricing Architecture</div>', unsafe_allow_html=True)
            
            # Prepare chart data from filtered_df
            chart_df_filtered = filtered_df.copy()
            for col in cols_to_clean:
                chart_df_filtered[col] = pd.to_numeric(chart_df_filtered[col], errors='coerce').fillna(0)

            melted_df = chart_df_filtered.melt(id_vars=['dsoName'], value_vars=['priceDenture', 'priceTier1Low', 'priceTier1High'], var_name='Tier', value_name='Price')
            
            # Custom mapping for cleaner legend names
            tier_names = {
                "priceDenture": "Economy Denture", 
                "priceTier1Low": "Tier 1 (Low)", 
                "priceTier1High": "Tier 1 (High)"
            }
            melted_df['Tier'] = melted_df['Tier'].map(tier_names)

            # Filter out 0 prices from chart
            melted_df = melted_df[melted_df['Price'] > 0]

            fig = px.bar(
                melted_df, 
                x='dsoName', 
                y='Price', 
                color='Tier', 
                barmode='group',
                color_discrete_map={
                    "Economy Denture": "#93c5fd", # Light Blue
                    "Tier 1 (Low)": "#3b82f6",    # Blue
                    "Tier 1 (High)": "#1e40af"    # Dark Blue
                },
                height=500,
                template="plotly_white" # Ensuring clean white background
            )
            
            fig.update_layout(
                font={'family': "Inter, sans-serif"},
                xaxis={'title': None, 'tickangle': -45},
                yaxis={'title': 'Price ($)'},
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
            )
            
            st.plotly_chart(fig, use_container_width=True)
        else:
             if search_query:
                 st.info("No competitors found matching your search.")
    else:
        st.error("No data available. If using 'Other...', try a specific city name or check your internet connection for AI search.")

# --- PAGE 2: COMPETITOR DETAILS ---
elif selected_page == "Competitor Details":
    st.markdown(f'<div class="main-title">Competitor Deep Dive</div>', unsafe_allow_html=True)
    
    if not selected_dma:
        st.warning("Please select a market in the sidebar first.")
        st.stop()

    with st.spinner("Loading Context..."):
        matrix_data = brain.get_market_matrix(selected_dma)
    
    if not matrix_data:
        st.error("No market data found.")
        st.stop()

    dso_names = [d['dsoName'] for d in matrix_data]
    
    col_nav, col_main = st.columns([1, 2.5])
    
    with col_nav:
        st.markdown("### Select Competitor")
        selected_dso = st.radio("Competitor List", dso_names, label_visibility="collapsed")
        
        st.divider()
        
        if selected_dso:
            sel_data = next((item for item in matrix_data if item["dsoName"] == selected_dso), None)
            if sel_data:
                 # Quick Stats Card
                 st.markdown(f"""
                 <div class="info-box">
                    <strong>📊 Quick Stats</strong><br>
                    🏥 Clinics: {sel_data['clinicCount']}<br>
                    🦷 Dentists: {sel_data['dentistCount']}<br>
                    👨‍⚕️ Surgeons: {sel_data['surgeonCount']}
                 </div>
                 """, unsafe_allow_html=True)
                 
                 # Price Mini Chart (Graphic on the left fix)
                 st.caption("Price Reference")
                 p_items = []
                 if sel_data['priceDenture'] != 'TBD': p_items.append({'Label': 'Econ', 'Price': sel_data['priceDenture']})
                 if sel_data['priceTier1Low'] != 'TBD': p_items.append({'Label': 'T1 Low', 'Price': sel_data['priceTier1Low']})
                 
                 if p_items:
                     p_df = pd.DataFrame(p_items)
                     fig_mini = px.bar(p_df, x="Price", y="Label", orientation='h', text="Price", template="plotly_white")
                     fig_mini.update_traces(marker_color='#3b82f6', texttemplate='$%{text:.0f}')
                     fig_mini.update_layout(xaxis={'visible': False}, yaxis={'title': None}, height=200, margin=dict(l=0, r=0, t=0, b=0))
                     st.plotly_chart(fig_mini, use_container_width=True)

    with col_main:
        if selected_dso:
            st.markdown(f"## {selected_dso}")
            
            with st.spinner(f"Gathering intelligence on {selected_dso}..."):
                details = brain.get_competitor_details(selected_dma, selected_dso)
            
            # Lists
            st.markdown("### 🧬 Personnel Forensics")
            c1, c2 = st.columns(2)
            
            with c1:
                st.markdown("**Identified Dentists**")
                if details['dentistNames']:
                    for name in details['dentistNames']:
                        st.markdown(f"- 🦷 {name}")
                else:
                    st.caption("No public records found.")

            with c2:
                st.markdown("**Identified Surgeons**")
                if details['surgeonNames']:
                    for name in details['surgeonNames']:
                        st.markdown(f"- 💉 {name}")
                else:
                    st.caption("No public records found.")

            st.markdown("---")
            st.info(f"**Evidence Source:** {details.get('evidenceSource', 'AI Generated Estimation')}")

# --- PAGE 3: RESEARCH LAB ---
elif selected_page == "Research Lab":
    st.markdown(f'<div class="main-title">Field Research Lab</div>', unsafe_allow_html=True)
    st.caption("Ask Agent 260206 specific questions about market trends.")

    # Chat UI
    if "messages" not in st.session_state:
        st.session_state.messages = []

    for message in st.session_state.messages:
        with st.chat_message(message["role"], avatar="🦷" if message["role"] == "assistant" else "👤"):
            st.markdown(message["content"])

    if prompt := st.chat_input("Ask Agent 260206..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user", avatar="👤"):
            st.markdown(prompt)

        with st.chat_message("assistant", avatar="🦷"):
            with st.spinner("Thinking..."):
                response = brain.chat(prompt)
            st.markdown(response)
        
        st.session_state.messages.append({"role": "assistant", "content": response})
