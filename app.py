import streamlit as st
import pandas as pd
import plotly.express as px
from brain import brain

# --- PAGE CONFIG ---
st.set_page_config(
    page_title="AD&I Market Intelligence",
    page_icon="🦷",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- CSS STYLING ---
st.markdown("""
<style>
    .main-header { font-size: 2.5rem; font-weight: 700; color: #1e3a8a; }
    .sub-header { font-size: 1.2rem; color: #64748b; }
    .metric-card { background-color: #f1f5f9; padding: 20px; border-radius: 10px; border-left: 5px solid #3b82f6; }
    div[data-testid="stMetricValue"] { font-size: 1.8rem; }
</style>
""", unsafe_allow_html=True)

# --- SIDEBAR ---
with st.sidebar:
    st.title("AD&I Intelligence")
    st.caption("Market Strategist Agent 260206")
    
    selected_page = st.radio("Navigation", ["Market Matrix", "Competitor Details", "Research Lab"])
    
    st.divider()
    
    selected_dma = st.selectbox(
        "Target DMA", 
        ["Dallas-Fort Worth", "Houston", "Austin", "San Antonio"]
    )
    
    st.info(f"Context Locked: {selected_dma}")

# --- PAGE 1: MARKET MATRIX ---
if selected_page == "Market Matrix":
    st.markdown('<div class="main-header">Competitive Market Matrix</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="sub-header">Analyzing Landscape for: {selected_dma}</div>', unsafe_allow_html=True)
    st.divider()

    with st.spinner("Retrieving Market Intelligence (Checking L1 Locks...)..."):
        data = brain.get_market_matrix(selected_dma)
    
    if data:
        df = pd.DataFrame(data)
        
        # 1. Clean Data for Visualization (Handle TBDs)
        chart_df = df.copy()
        # Convert TBD to 0 for charting
        cols_to_clean = ['priceDenture', 'priceTier1Low', 'priceTier1High']
        for col in cols_to_clean:
            chart_df[col] = pd.to_numeric(chart_df[col], errors='coerce').fillna(0)

        # 2. Key Metrics Row
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            st.metric("Total Competitors", len(df))
        with c2:
            st.metric("Avg Clinics", round(df['clinicCount'].mean(), 1))
        with c3:
            st.metric("Total Surgeons", df['surgeonCount'].sum())
        with c4:
            # Calc avg price ignoring 0s
            avg_price = chart_df[chart_df['priceDenture'] > 0]['priceDenture'].mean()
            st.metric("Avg Econ Denture", f"${avg_price:,.0f}")

        # 3. The Main Table
        st.subheader("Level 1: Competitive Scan")
        st.dataframe(
            df,
            column_config={
                "dsoName": "DSO / Practice",
                "priceDenture": st.column_config.NumberColumn("Econ Denture", format="$%d"),
                "priceTier1Low": st.column_config.NumberColumn("Tier 1 (Low)", format="$%d"),
                "priceTier1High": st.column_config.NumberColumn("Tier 1 (High)", format="$%d"),
            },
            use_container_width=True,
            hide_index=True,
            height=500
        )

        # 4. Visualization (Price Ranges)
        st.subheader("Price Positioning Analysis")
        # Melting for grouped bar chart
        melted_df = chart_df.melt(id_vars=['dsoName'], value_vars=['priceDenture', 'priceTier1Low', 'priceTier1High'], var_name='Tier', value_name='Price')
        
        fig = px.bar(
            melted_df, 
            x='dsoName', 
            y='Price', 
            color='Tier', 
            barmode='group',
            title="Competitor Pricing Architecture",
            color_discrete_map={
                "priceDenture": "#3b82f6", 
                "priceTier1Low": "#10b981", 
                "priceTier1High": "#f59e0b"
            }
        )
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.error("No data available for this market.")

# --- PAGE 2: COMPETITOR DETAILS ---
elif selected_page == "Competitor Details":
    st.markdown('<div class="main-header">Competitor Deep Dive</div>', unsafe_allow_html=True)
    
    # Needs matrix data to populate dropdown
    matrix_data = brain.get_market_matrix(selected_dma)
    dso_names = [d['dsoName'] for d in matrix_data]
    
    col_nav, col_main = st.columns([1, 3])
    
    with col_nav:
        selected_dso = st.radio("Select Competitor", dso_names)
        
        # Mini Price Ref
        selected_dso_data = next((item for item in matrix_data if item["dsoName"] == selected_dso), None)
        if selected_dso_data:
            st.markdown("### Quick Pricing")
            st.markdown(f"**Denture:** {selected_dso_data['priceDenture']}")
            st.markdown(f"**Tier 1:** {selected_dso_data['priceTier1Low']} - {selected_dso_data['priceTier1High']}")

    with col_main:
        if selected_dso:
            st.subheader(f"Intelligence Report: {selected_dso}")
            with st.spinner("Accessing public records & evidence..."):
                details = brain.get_competitor_details(selected_dma, selected_dso)
            
            # Visual References (Placeholder for actual visuals logic)
            st.markdown("#### Price Tier Visual References")
            
            # Simulated Chart for this specific competitor
            p_data = {
                "Package": ["Economy", "Tier 1 (Low)", "Tier 1 (High)"],
                "Price": [
                    selected_dso_data['priceDenture'] if selected_dso_data['priceDenture'] != 'TBD' else 0,
                    selected_dso_data['priceTier1Low'] if selected_dso_data['priceTier1Low'] != 'TBD' else 0,
                    selected_dso_data['priceTier1High'] if selected_dso_data['priceTier1High'] != 'TBD' else 0
                ]
            }
            fig_detail = px.bar(p_data, x="Price", y="Package", orientation='h', title=f"{selected_dso} Pricing Structure")
            st.plotly_chart(fig_detail, use_container_width=True)

            # Personnel Lists
            c1, c2 = st.columns(2)
            with c1:
                st.markdown("#### 🦷 Identified Dentists")
                if details['dentistNames']:
                    for name in details['dentistNames']:
                        st.text(f"• {name}")
                else:
                    st.caption("No specific names identified.")
            
            with c2:
                st.markdown("#### 🏥 Surgeons (Implant/Oral)")
                if details['surgeonNames']:
                    for name in details['surgeonNames']:
                        st.text(f"• {name}")
                else:
                    st.caption("No specific surgeons identified.")
            
            st.warning(f"**Evidence Source:** {details.get('evidenceSource', 'N/A')}")

# --- PAGE 3: RESEARCH LAB ---
elif selected_page == "Research Lab":
    st.markdown('<div class="main-header">Field Research Lab</div>', unsafe_allow_html=True)
    st.caption("Chat with the Agent to uncover specific insights or generate hypotheses.")
    
    if "messages" not in st.session_state:
        st.session_state.messages = []

    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    if prompt := st.chat_input("Ask about market trends..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            response = brain.chat(prompt)
            st.markdown(response)
        
        st.session_state.messages.append({"role": "assistant", "content": response})
