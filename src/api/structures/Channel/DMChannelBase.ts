import { ChannelBase } from "..";
import { ChannelType } from "../../types/types";
import { ChannelUtil } from "../../utils";

export abstract class DMChannelBase<T extends ChannelType> extends ChannelUtil.ApplyTextBased(ChannelBase)<T> {
}