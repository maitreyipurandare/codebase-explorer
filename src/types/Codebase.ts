export interface CodeFile {
    id: string;
    name: string;
    path: string;
    language: string;
    code: string;
}

export interface CodeRelationship {
    source: string;
    target: string;
    type: string;
}

export interface Codebase {
    files: CodeFile[];
    relationships: CodeRelationship[];
}