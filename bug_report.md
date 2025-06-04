---
name: Syntax Error in GET Request with OData $count Operator When Response Contains No Data
about: Address a bug causing a syntax error when executing a GET request with the OData $count operator in a CAP project, resulting in a 500 error when no data is present in the response.
title: 'Syntax Error in GET Request with OData $count Operator When Response Contains No Data'
labels: bug
assignees: ''

---

<!-- Please support your supporters: Avoid screen shots and use markdown as much as possible

Avoid code screen shots from your IDE where ever possible, instead use [code markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#code) and syntax highlighting: `cds`, `sql`, `diff`.

- Bitmap images are hard to read due to different color schemes and screen resolutions.
  Usually they need to be opened in a different browser tab, enlarged etc.
  Especially when working on multiple issues in parallel, it's easy to loose sight.
- Code/Messages can't be copied/pasted into own editors, test files etc.
-->


### Description of erroneous behaviour 

The GET request described in step 5 below fails when there is no data present in the response to the query.

> The referred query 
```

http://localhost:4004/odata/v4/cloud/VM?$apply=filter((lob/cost_object_code eq 'cheap') and (labels/any(l:(l/label_labelKey eq 'env' and l/label_value eq 'prod'))) and (status eq 'RUNNING' or status eq 'PARKED' or status eq 'Updating' or status eq 'Succeeded') and platform eq 'AWS')/groupby((lob/name,lob/cloud_id))&$top=500&$count=true

```

> Temporary Workaround:
By removing the $count operator from the OData query the issue is mitigated. However, this way the functionality of the $count operator is lost.

### Detailed steps to reproduce

1. git clone https://github.com/dimitar-nikolov-lazarov/capjs-demos.git
2. npm install
3. cds deploy
4. cds watch
5. Execute GET request: 
```
http://localhost:4004/odata/v4/cloud/VM?$apply=filter((lob/cost_object_code eq 'cheap') and (labels/any(l:(l/label_labelKey eq 'env' and l/label_value eq 'prod'))) and (status eq 'RUNNING' or status eq 'PARKED' or status eq 'Updating' or status eq 'Succeeded') and platform eq 'AWS')/groupby((lob/name,lob/cloud_id))&$top=500&$count=true
```
Error response: 
```
{
  "error": {
    "code": "500",
    "message": "near \"FROM\": syntax error in:\nSELECT json_insert('{}','$.\"count\"',count) as _json_ FROM (SELECT count(*) as count FROM (SELECT FROM (SELECT \"$V\".platform,\"$V\".platformId,\"$V\".workspace,\"$V\".name,\"$V\".status,\"$V\".zone,\"$V\".region,\"$V\".hostname FROM CloudService_VM as \"$V\" left JOIN CloudService_LOB as lob2 ON lob2.cloud_id = \"$V\".workspace WHERE (lob2.cost_object_code = ?) and (exists (SELECT 1 as \"1\" FROM CloudService_VMLabels as \"$l\" WHERE \"$l\".vm_platformId = \"$V\".platformId and \"$l\".vm_platform = \"$V\".platform and (\"$l\".label_labelKey = ? and \"$l\".label_value = ?))) and (\"$V\".status = ? or \"$V\".status = ? or \"$V\".status = ? or \"$V\".status = ?) and \"$V\".platform = ? ORDER BY \"$V\".platform COLLATE NOCASE ASC,\"$V\".platformId COLLATE NOCASE ASC) as __select__2 left JOIN CloudService_LOB as lob ON lob.cloud_id = __select__2.workspace GROUP BY lob.name,lob.cloud_id) as __select__ LIMIT ?)"
  }
}
```

### Details about your project

| Demo Repo         | https://github.com/dimitar-nikolov-lazarov/capjs-demos.git |  | CDS9 https://github.com/dimitar-nikolov-lazarov/capjs-demos.git 
|:-----------------------|----------|--|------------|
| @cap-js/asyncapi       | 1.0.3    |  |            |
| @cap-js/cds-types      | 0.6.5    |  |            |
| @cap-js/db-service     | 1.20.2   |  |            |
| @cap-js/hana           | 1.9.1    |  |            |
| @cap-js/openapi        | 1.1.2    |  |            |
| @cap-js/sqlite         | 1.11.1   |  |            |
| @sap/cds               | 8.9.4    |  |            |
| @sap/cds-compiler      | 5.9.4    |  |            |
| @sap/cds-dk (global)   | 9.0.4    |  |            |
| @sap/cds-fiori         | 1.4.1    |  |            |
| @sap/cds-foss          | 5.0.1    |  |            |
| @sap/cds-mtxs          | 3.0.1    |  |            |
| Node.js                | v22.12.0 |  |            |

