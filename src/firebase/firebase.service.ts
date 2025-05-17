import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateFirebaseDto } from './dto/create-firebase.dto';
import { UpdateFirebaseDto } from './dto/update-firebase.dto';
import { OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestore: admin.firestore.Firestore;

  onModuleInit() {
    try{
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: ( "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDWZS96dSm2JOFk\nHj4TWNDrCng3oC17PbHsooFht1BdPqeALjUuz3CSgO+DrXDvDEmQJsCAb6xQ7lnz\njqQTJB3xZKFPvodoQ69MZUAMUjSaVt3Wh2hbcHIgCq26thcApsTgvJwvC3i64JtV\nJiFUoYPm9RHjPqiHCj1AbFAzbfNv3xnRNR1LNfA1qpslPmNSpiyaJDbe+4xkWqfu\nKSMu2eaHS79owQy1Y5LD5Afp5ULWZLXWqeStnvZ6eJ8aRFxOMrs3DCKkNV5nxYka\n6TllLxcPmB5OSXNF/vAAjyl5qEz9DbClsUk9QebLuIKwKCxSjy6cWfmKqRNAxGbg\nY+fzAOLXAgMBAAECggEACkoBq0888m1De+CPrhhqSyPN45PswUHGuWQn8J6X9sGi\nnESbb/54mPwjHB8SXaApvG2y4CpIpMgR/REjz3j0qIV7afsechYj4l2BlpXJyUmd\n8xIjvS+thA6L8K5iEDmKShbP9nOgfNqtDO5IvANvjYGTAcrobGkRyd1PRAiYBEHw\n/tUEixDNewqtRbHtBpndkl/OwxBtQFYLqvcorUoHWWfzBjmOcLMnNtGfff55sFtC\n61+7aSMjgyXCobzqGo5NojMfZiNbhsTgjY2HHqmF7PnRKSqFvqy6I3mPDnKj8m46\nSes2W5hQ1DPrY0FO73sccs/apLhCJZzzI//NJJOM4QKBgQD8iKQ8ZZRLY5HABa3c\nc1KCJMFkmAliQ3mgMhZNhRdimwMQOvAuyK7kFcteVK8ZZLisrpnFNF+2Mp8/NjxD\n3yvZEhqGdFJ9TQhc2H+KinR4nO5ytmgk47BkCIZ9AXerq7tOOnaUsZCXeLrwyW7X\nlj9y94QLlUfNaLbN9/t9cj6WmQKBgQDZVog0NHlTX9b/wLl9nZ5GEGkT3+9ObuEH\npwG0tgJXXXp+r8VaPbWiLiRj8N0cORt5XPsoOdhp/wMQ8m0qvdkf5ckkJHZLbVZQ\nTFYX//R9r9v+PfMKgHMCl5cq23uLpRQCwLvF/vTluvvHsDsnrUQdnaX76Vuii7bN\neeVgaXTa7wKBgAZOz3NmwiaD7S8TtT0NcGEp097UYV+f+djDh4UWLvhakOAF6Nvy\nTVQLK1JG4TzMJETD87lWTpG5f/rPOwAjAfBhIGJ9Y1YX536SNdVbEf+1Q8t/vOg2\n+7/z6pASyk9ycbJJiY67RLZT4K+FCIzABwOzJQw5BVsfI3nPmOuQP/n5AoGAbkTk\nGDCjefS/XcWHlz84RW4gEhBlF1NUYxCN4gUSjQcFlm9R3yY+GIn2tqpHVQF4egv9\n9fvbXHQhNyD42F24YuGwOuExD7XqvBTu/YBEqNxn7se5nxNqxt7ouLrhJQndbEQj\nQSLJWCGVi0xTxx6215vb0kMk1gSy+++jvFXlDwsCgYAE7GaDQGD9nvdDjK7B3H2p\nd33fH3REUGcmKhD+06CzCNGqr2lOZ1VeB1yH65H0c4/+/OTPfa2PHno9X4z0grAJ\nC8oBOj5BWP47B3Ob4XMQZZEwRR9f7EHds1ARZ7HHkNIl9rlyvLrNS9skUgIxGGwL\nnodT1hbkwpeSShnVaaSRFA==\n-----END PRIVATE KEY-----\n").replace(/\\n/g, '\n'),
          }),
        });
      }
      this.firestore = admin.firestore();
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  getFirestore() {
    try{
      return this.firestore;
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }
  create(createFirebaseDto: CreateFirebaseDto) {
    try{
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  findAll() {
    try{
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  findOne(id: number) {
    try{
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  update(id: number, updateFirebaseDto: UpdateFirebaseDto) {
    try{
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  remove(id: number) {
    try{

    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }
}
