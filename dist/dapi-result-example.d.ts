declare function demonstrateDAPIResults(): Promise<void>;
declare const exampleDAPIResponse: {
    data: {
        messages: {
            code: string;
            message: string;
        }[];
        response: {
            data: {
                fieldData: {
                    _ID: string;
                    d__DOB: string;
                    d__Gender: string;
                    d__Name: string;
                    d__NumberOfQualifications: string;
                    d__StartsWorkAt: string;
                    d__Surname: string;
                    z__CreatedBy: string;
                    z__CreationTimestamp: string;
                    z__ModificationTimestamp: string;
                    z__ModifiedBy: string;
                };
                modId: string;
                portalData: {};
                recordId: string;
            }[];
            dataInfo: {
                database: string;
                foundCount: number;
                layout: string;
                returnedCount: number;
                table: string;
                totalRecordCount: number;
            };
        };
    };
    error: number;
};
export { demonstrateDAPIResults, exampleDAPIResponse };
//# sourceMappingURL=dapi-result-example.d.ts.map