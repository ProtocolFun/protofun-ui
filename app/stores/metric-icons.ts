"use client";
import {
  AttachMoney,
  LocalGasStationOutlined,
  ReceiptLong,
  SvgIconComponent,
} from "@mui/icons-material";

import { MetricId } from "./metrics";
import { ProtocolId } from "./protocols";

export const METRIC_ICONS_MAP: Partial<
  Record<ProtocolId, Record<MetricId, SvgIconComponent>>
> = {
  eth: {
    base_fee: LocalGasStationOutlined,
    eth_price: AttachMoney,
    transaction_cost: ReceiptLong,
    transaction_cost_usd: ReceiptLong,
  },
};
