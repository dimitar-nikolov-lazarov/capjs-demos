namespace my.cloud;

entity Books {
  key ID : Integer;
  title  : String;
  stock  : Integer;
}

/**
 *
 */
type Platform           : String enum {
  AWS;
  GCP;
  AZURE;
}

/**
 * Present Label type
 */
define type Label {
  /**
   * Key of the label
   */
  labelKey : String;
  /**
   * Label value
   */
  value    : String;
}

/**
 * History field type definition used to track VM attribute changes.
 */
define type HistoryField {
  /**
   * Name of the attribute.
   */
  attribute : String;
  /**
   * Value of the attribute.
   */
  value     : String;
}

@singular: 'VMLabels'
@plural  : 'VMLabelsList'
define entity VMLabels {
  label : Label;
  vm    : Association to VM;
}

define entity VM {
  key platform               :      Platform;
  key platformId             :      String;
      workspace              :      String;
      name                   :      String;
      status                 :      String(20);
      zone                   :      String;
      region                 :      String;
      hostname               :      String;
      labels                 :      Composition of many VMLabels
                                      on  labels.vm.platformId = $self.platformId
                                      and labels.vm.platform   = $self.platform;

      lob               : Association to LOB
                        on lob.cloud_id = $self.workspace;
}

entity LOB {
  key id                     :      UUID;
      name                   :      String;
      vms                    :      Association to many VM
                                      on vms.workspace = $self.cloud_id;
      cloud_id               :      String;
      type                   :      Platform;
      cost_object_code       :      String;
}