"""
Sagar Setu — Vessel Matcher & Recommendation Engine
"""
from typing import List
from api.models import CargoOrder, Port, Route, VesselType, CharterTypeEnum
from api.schemas import VesselRecommendation

class VesselMatcher:
    def __init__(self, current_freight_rates: dict, bunker_price: float = 600.0):
        """
        current_freight_rates: Dict mapping vessel_type string to current predicted rate_usd_per_ton
        bunker_price: Average bunker price (USD/ton) for calculation
        """
        self.rates = current_freight_rates
        self.bunker_price = bunker_price

    def get_feasible_vessel_types(self, order_qty: int, dest_port_draft: float) -> List[str]:
        """Filters vessels based on draft and lot size."""
        feasible = []
        
        # Capesize rules: >100k tons, draft > 16.0m
        if order_qty >= 100000 and dest_port_draft >= 16.0:
            feasible.append(VesselType.CAPESIZE.value)
            
        # Panamax rules: 60k - 100k tons, draft > 13.0m
        if 50000 <= order_qty <= 120000 and dest_port_draft >= 13.0:
            feasible.append(VesselType.PANAMAX.value)
            
        # Supramax rules: 40k - 65k tons, draft > 11.0m
        if 35000 <= order_qty <= 70000 and dest_port_draft >= 11.0:
            feasible.append(VesselType.SUPRAMAX.value)
            
        # Handysize rules: < 40k tons, draft > 9.0m
        if order_qty <= 45000 and dest_port_draft >= 9.0:
            feasible.append(VesselType.HANDYSIZE.value)
            
        # Fallback if nothing fits perfectly (e.g. huge order, shallow port) -> use multiple smaller vessels
        # For simplicity in demo, we return the largest feasible vessel that fits the draft
        if not feasible:
            if dest_port_draft >= 16.0:
                feasible = [VesselType.CAPESIZE.value, VesselType.PANAMAX.value]
            elif dest_port_draft >= 13.0:
                feasible = [VesselType.PANAMAX.value, VesselType.SUPRAMAX.value]
            elif dest_port_draft >= 11.0:
                feasible = [VesselType.SUPRAMAX.value, VesselType.HANDYSIZE.value]
            else:
                feasible = [VesselType.HANDYSIZE.value]
                
        return feasible

    def recommend(self, cargo_order: CargoOrder, destination_port: Port, distance_nm: float) -> List[VesselRecommendation]:
        """Generates ranked recommendations for a cargo order."""
        feasible_types = self.get_feasible_vessel_types(cargo_order.quantity_tons, destination_port.max_draft_m)
        recommendations = []
        
        for v_type in feasible_types:
            rate = self.rates.get(v_type, 15.0) # Fallback rate if not found
            
            # 1. Voyage Charter Calculation
            # In voyage charter, rate is per ton
            voyage_cost = rate * cargo_order.quantity_tons
            
            # Confidence decreases slightly for larger vessels due to market volatility
            base_confidence = 0.9 if v_type in [VesselType.PANAMAX.value, VesselType.SUPRAMAX.value] else 0.8
            
            recommendations.append(
                VesselRecommendation(
                    vessel_type=v_type,
                    charter_type=CharterTypeEnum.VOYAGE.value,
                    projected_rate_usd_per_ton=rate,
                    total_estimated_cost_usd=voyage_cost,
                    confidence=base_confidence,
                    reasoning=f"Standard voyage charter based on forecasted {v_type} rates."
                )
            )
            
            # 2. Time Charter Calculation (simplified equivalent)
            # TC is usually slightly cheaper per ton if round-trip is optimized, but carries bunker risk
            tc_rate = rate * 0.95 
            tc_cost = tc_rate * cargo_order.quantity_tons
            
            recommendations.append(
                VesselRecommendation(
                    vessel_type=v_type,
                    charter_type=CharterTypeEnum.TIME_CHARTER.value,
                    projected_rate_usd_per_ton=tc_rate,
                    total_estimated_cost_usd=tc_cost,
                    confidence=base_confidence - 0.1, # Lower confidence due to bunker exposure
                    reasoning="Time charter equivalent (assuming standard round voyage). Recommended if bunker prices trend lower."
                )
            )

        # Sort by total estimated cost ascending
        recommendations.sort(key=lambda x: x.total_estimated_cost_usd)
        
        # Mark best value
        if recommendations:
            recommendations[0].is_best_value = True
            
        return recommendations
