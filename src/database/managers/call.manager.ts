import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CallDB, CallDocumentDB } from '../schemas';
import { BaseManager } from './base.manager';
import { CallStatus, CallType } from '../../types';

@Injectable()
export class CallManager extends BaseManager<CallDocumentDB> {
  constructor(
    @InjectModel(CallDB.name)
    private model: Model<CallDocumentDB>,
  ) {
    super(model, CallDB.name);
  }

  async create(
    entityId: number,
    phone: string,
    type: CallType,
    body: any,
  ): Promise<CallDB> {
    return this.model.findOneAndUpdate(
      {
        callId: body.callid,
      },
      {
        $setOnInsert: {
          id: await this.getNextSequence(),
          entityId,
          phone,
          type,
          status: body.status,
          callId: body.callid,
          timeStart: body.timestart,
          callDuration: +body.callduraction || 0,
          talkDuration: +body.talkduraction || 0,
          recording: body.recording,
        },
      },
      {
        new: true,
        upsert: true,
      },
    );
  }

  async findLastAnswered(entityIds: number[], phone: string) {
    const date = new Date();
    date.setDate(date.getDate() - 2);

    return this.model.find({
      createdAt: {
        $gte: date,
      },
      phone,
      entityId: entityIds,
      status: CallStatus.ANSWERED,
    });
  }
}
