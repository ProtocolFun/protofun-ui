"use client"
import {
  AttachMoney,
  LocalGasStationOutlined,
  ReceiptLong,
  SvgIconComponent,
} from "@mui/icons-material"

import { MetricId } from "./metrics"
import { ProtocolId } from "./protocols"

export const METRIC_ICONS_MAP: Partial<
  Record<ProtocolId, Partial<Record<MetricId, SvgIconComponent>>>
> = {
  comp: {
    tvl: AttachMoney,
  },
  eth: {
    base_fee: LocalGasStationOutlined,
    eth_price: AttachMoney,
    tx_cost: ReceiptLong,
  },
}
