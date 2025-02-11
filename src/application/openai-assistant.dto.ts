export class CreateAssistantDto {
  name: string;
  instructions: string;
  model: string;
}

export class CreateMessageDto {
  threadId: string;
  content: string;
}

export class ListMessageDto {
  threadId: string;
}

export class CreateRunDto {
  threadId: string;
  assistantId: string;
}

export class RetrieveRunDto {
  threadId: string;
  runId: string;
}
