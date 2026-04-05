# data_model_list
- task
- task_track_record

## task
- description
    - manage task detail
    - child tasks retain the parent task id
- fields
    - id: uuid, not null
    - task_name: varchar, not null
    - description: text
    - status: int, not null, (0:waiting, 1:working, 2:completed)
    - parent_id: uuid
    - disp_order: int, not null,  
    - created_at: datetime, not null, default = current datetime of system
    - updated_at: datetime, not null, default = current datetime of system

## task_track_record
- description
    - manage task track record
    - the smallest unit is 0.25h
    - multiple records can be registered with the same task id 
        - e.g., Task A performed from 11:00 to 12:00, Task A performed again from 13:00 to 14:00
    - **records of less than 0.25 hours will not be registered**
- fileds
    - id: uuid, not null
    - task_id: uuid, not null, references = task(id)  
    - start_datetime: datetime 
    - end_datetime: datetime

---

## Q&A

**Q. `is_parent` を設けた理由は？**  
A. `parent_id` が null かどうかで判定できるが、不具合で ID の登録に失敗しているケースとの切り分けを想定していた。  
→ ID 登録失敗はバリデーションで対処する方が確実なため削除。

**Q. `created_by` / `updated_by` を設けた理由は？**  
A. 将来的な DB 移管を想定していた。  
→ シングルユーザーアプリのため現時点では不要。削除。

**Q. `man_hour` の型が `int` だが 0.25h を表現できないのでは？**  
A. `float` に修正予定だったが、そもそも `start_datetime` と `end_datetime` から計算可能なため削除。毎回計算するのはパフォーマンス的によくないと考えてキャッシュする設計にしていたが、このアプリの規模では計算コストは無視できる。保存するとデータ整合性リスクが生まれるため非保存とし、エクスポート時に集計して付与する。

**Q. `man_hour` を `task` に移動してエクスポート時のフォーマットに使うのはどうか？**  
A. `task_track_record` を変更するたびに `task.man_hour` も更新しなければならず、整合性の問題は変わらない。エクスポート関数内で集計して付与する方が確実でシンプル。

**Q. `created_by` を削除するなら `created_at` も不要では？**  
A. `created_by`（誰が）と `created_at`（いつ）は目的が異なる。`created_at` はタスクの作成日時としてソートや表示に使える可能性があるため保持。

**Q. `updated_at` はソートや表示に利用するか？**  
A. ソートや表示よりデバッグや変更履歴の追跡が主な用途だが、エクスポート時に更新日時として出力するために保持。

**Q. TypeScript上はクラスとして定義すれば良いですか？**  
A. クラスより `type` または `interface` で定義するのが一般的。クラスはメソッドを持つオブジェクトを作るときに使うが、データモデルはただのデータ構造なので型定義で十分。

---

## 設計上の意思決定

| フィールド | 決定 | 理由 |
|---|---|---|
| `is_parent` | 削除 | `parent_id` が null かどうかで判定可能。ID登録失敗との切り分けはバリデーションで対処 |
| `created_by` / `updated_by` | 削除 | シングルユーザーアプリのため不要 |
| `created_at` | 保持 | タスクの作成日時。将来的なソートや表示への利用を想定 |
| `updated_at` | 保持 | エクスポート時に更新日時として出力するために使用 |
| `man_hour` | 削除 | `start_datetime` と `end_datetime` から計算可能。データ整合性リスクを避けるため非保存。エクスポート時に集計して付与する |
| エクスポート仕様 | 別ファイルで定義 | data-model は保存構造のみ。出力フォーマットは実装時に `export-spec.md` で定義予定 |
