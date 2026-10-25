import { StyleSheet, View } from "react-native";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useUIStore } from "@/store/uiStore";

import { FeedTab } from "./FeedTab";
import { FilterBar } from "./FilterBar";
import { PapersTab } from "./PapersTab";
import { TeachersTab } from "./TeachersTab";

export function HomeTabs() {
  const selectedHomeTab = useUIStore((state) => state.selectedHomeTab);
  const setSelectedHomeTab = useUIStore((state) => state.setSelectedHomeTab);

  const segmentedValue =
    selectedHomeTab === "teachers"
      ? "Teachers"
      : selectedHomeTab === "feed"
        ? "Feed"
        : "Papers";

  return (
    <View style={styles.container}>
      <SegmentedControl
        options={["Teachers", "Feed", "Papers"]}
        active={segmentedValue}
        onChange={(option) => {
          const mapped =
            option === "Teachers"
              ? "teachers"
              : option === "Feed"
                ? "feed"
                : "papers";
          setSelectedHomeTab(mapped);
        }}
      />

      {selectedHomeTab !== "feed" ? (
        <View style={styles.filterWrap}>
          <FilterBar showLocation={selectedHomeTab === "teachers"} />
        </View>
      ) : null}

      <View style={styles.tabBody}>
        {selectedHomeTab === "teachers" ? <TeachersTab /> : null}
        {selectedHomeTab === "feed" ? <FeedTab /> : null}
        {selectedHomeTab === "papers" ? <PapersTab /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  filterWrap: {
    marginBottom: 4,
  },
  tabBody: {
    flex: 1,
    minHeight: 200,
  },
});
