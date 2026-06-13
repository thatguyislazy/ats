import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 48,
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    color: "#1a1a1a",
    lineHeight: 1.4,
  },
  header: {
    textAlign: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontFamily: "Times-Bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  contactRow: {
    fontSize: 9.5,
    color: "#333333",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
    marginTop: 10,
    borderBottomWidth: 0.75,
    borderBottomColor: "#000000",
    paddingBottom: 2,
  },
  summaryText: {
    fontSize: 10.5,
    marginBottom: 4,
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  entryLeft: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
  },
  entrySubLeft: {
    fontStyle: "italic",
    fontSize: 10,
    marginTop: 1,
  },
  entryRight: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    textAlign: "right",
  },
  bulletList: {
    marginTop: 3,
    paddingLeft: 14,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
  },
  skillsText: {
    fontSize: 10.5,
  },
  activityItem: {
    fontSize: 10,
    marginBottom: 2,
  },
});

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function BulletList({ items = [] }) {
  return (
    <View style={styles.bulletList}>
      {items.map((item, idx) => (
        <View key={idx} style={styles.bulletItem}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function HarvardCVDocument({ data }) {
  const {
    name,
    contact = {},
    summary,
    education = [],
    experience = [],
    skills = [],
    activities = [],
  } = data || {};

  const contactLine = [
    contact.location,
    contact.phone,
    contact.email,
    contact.linkedin,
  ]
    .filter(Boolean)
    .join("  |  ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{name?.toUpperCase() || "YOUR NAME"}</Text>
          {contactLine && <Text style={styles.contactRow}>{contactLine}</Text>}
        </View>

        <View style={styles.divider} />

        {summary && (
          <View>
            <SectionTitle>Professional Summary</SectionTitle>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        {education.length > 0 && (
          <View>
            <SectionTitle>Education</SectionTitle>
            {education.map((edu, idx) => (
              <View key={idx}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryLeft}>{edu.school}</Text>
                  <Text style={styles.entryRight}>{edu.dates}</Text>
                </View>
                <Text style={styles.entrySubLeft}>{edu.degree}</Text>
                {edu.details && (
                  <Text style={styles.summaryText}>{edu.details}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {experience.length > 0 && (
          <View>
            <SectionTitle>Experience</SectionTitle>
            {experience.map((exp, idx) => (
              <View key={idx}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryLeft}>{exp.company}</Text>
                  <Text style={styles.entryRight}>{exp.dates}</Text>
                </View>
                <Text style={styles.entrySubLeft}>{exp.title}</Text>
                <BulletList items={exp.bullets} />
              </View>
            ))}
          </View>
        )}

        {skills.length > 0 && (
          <View>
            <SectionTitle>Skills</SectionTitle>
            <Text style={styles.skillsText}>{skills.join("  •  ")}</Text>
          </View>
        )}

        {activities.length > 0 && (
          <View>
            <SectionTitle>Leadership &amp; Activities</SectionTitle>
            {activities.map((act, idx) => (
              <Text key={idx} style={styles.activityItem}>
                • {act}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}